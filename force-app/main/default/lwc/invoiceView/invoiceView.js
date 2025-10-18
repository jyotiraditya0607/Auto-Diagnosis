import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getInvoices from '@salesforce/apex/InvoiceQuery.getInvoices';

export default class InvoiceView extends NavigationMixin(LightningElement) {

    invoiceToShow = [];

    @wire(getInvoices)
    invoiceHandler(response) {
        const { error, data } = response;
        if (data) {
            this.invoiceToShow = data.map(inv => ({
                ...inv,
                InvoiceDateDisplay: inv.Invoice_Date__c ? new Date(inv.Invoice_Date__c).toLocaleDateString() : 'N/A',
                DueDateDisplay: inv.Due_Date__c ? new Date(inv.Due_Date__c).toLocaleDateString() : 'N/A',
                ClientName: inv.Client__r ? inv.Client__r.Name : (inv.Client_Name__c || 'N/A'),
                ServiceRequestName: inv.Service_Request__r ? inv.Service_Request__r.Name : 'N/A',
                TechnicianName: inv.Technician__r ? inv.Technician__r.Name : 'N/A',
                VehicleName: inv.Vehicle__r ? inv.Vehicle__r.Name : 'N/A',
                TotalAmountDisplay: inv.Total_Amount__c ? this.formatCurrency(inv.Total_Amount__c) : '$0.00',
                LabourCostDisplay: inv.Labour_Cost__c ? this.formatCurrency(inv.Labour_Cost__c) : '$0.00',
                PartCostDisplay: inv.Part_Cost__c ? this.formatCurrency(inv.Part_Cost__c) : '$0.00',
                TaxDisplay: inv.Tax__c ? this.formatCurrency(inv.Tax__c) : '$0.00',
                DiscountDisplay: inv.Discount__c ? this.formatCurrency(inv.Discount__c) : '$0.00',
                StatusClass: this.getStatusClass(inv.Status__c),
                PaymentMethodDisplay: inv.Payment_Method__c || 'Not Specified',
                ServiceTypeDisplay: inv.Service_Type__c || 'N/A'
            }));
        }
        if (error) {
            console.error('Error fetching invoices:', error);
        }
    }

    navigateToInvoice(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Invoicee__c',
                actionName: 'view'
            }
        });
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'paid':
                return 'status-paid';
            case 'pending':
                return 'status-pending';
            case 'overdue':
                return 'status-overdue';
            case 'draft':
                return 'status-draft';
            default:
                return 'status-default';
        }
    }
}