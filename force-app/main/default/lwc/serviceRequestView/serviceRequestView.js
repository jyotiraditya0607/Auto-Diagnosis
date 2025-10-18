import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getServiceRequests from '@salesforce/apex/ServiceRequestQuery.getServiceRequests';
import getRecordTypeIdByDeveloperName from '@salesforce/apex/ServiceRequestQuery.getRecordTypeIdByDeveloperName';

export default class ServiceRequestView extends NavigationMixin(LightningElement) {
   
    serviceRequestsToShow = [];
    showModal = false;


    recordTypeMapping = {
        'Inspection_Request': 'Inspection Request',
        'Maintenance_Request': 'Maintenance Request', 
        'Repair_Request': 'Repair Request',
        'Warranty_Claim_Request': 'Warranty Claim Request'
    };

    @wire(getServiceRequests)
    serviceRequestHandler(response) {
        const { error, data } = response;
        if (data) {
            this.serviceRequestsToShow = data.map(sr => ({
                ...sr,
                ServiceDateDisplay: sr.Service_Date__c ? this.formatDateTime(sr.Service_Date__c) : 'Not Scheduled',
                EstimatedCostDisplay: sr.Estimated_Cost__c ? this.formatCurrency(sr.Estimated_Cost__c) : 'TBD',
                WarrantyCoveredDisplay: sr.Warranty_Covered__c ? 'Yes' : 'No',
                StatusClass: this.getStatusClass(sr.Status__c),
                ClaimStatusClass: this.getApprovalStatusClass(sr.Claim_Approval_Status__c),
                DiscountStatusClass: this.getApprovalStatusClass(sr.Discount_Approval_Status__c)
            }));
        }
        if (error) {
            console.debug('Error: ' + JSON.stringify(error));
        }
    }

    formatDateTime(dateTimeString) {
        if (!dateTimeString) return 'N/A';
        const date = new Date(dateTimeString);
        return date.toLocaleString();
    }

    formatCurrency(amount) {
        if (!amount) return 'TBD';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    }

    getStatusClass(status) {
        if (!status) return 'status-unknown';
        
        const statusLower = status.toLowerCase();
        if (statusLower.includes('new') || statusLower.includes('open') || statusLower.includes('requested')) {
            return 'status-new';
        } else if (statusLower.includes('in progress') || statusLower.includes('scheduled') || statusLower.includes('assigned')) {
            return 'status-progress';
        } else if (statusLower.includes('completed') || statusLower.includes('closed') || statusLower.includes('done')) {
            return 'status-completed';
        } else if (statusLower.includes('cancelled') || statusLower.includes('rejected')) {
            return 'status-cancelled';
        } else if (statusLower.includes('pending')) {
            return 'status-pending';
        }
        return 'status-unknown';
    }

    getApprovalStatusClass(approvalStatus) {
        if (!approvalStatus) return 'approval-none';
        
        const statusLower = approvalStatus.toLowerCase();
        if (statusLower.includes('approved')) {
            return 'approval-approved';
        } else if (statusLower.includes('rejected') || statusLower.includes('denied')) {
            return 'approval-rejected';
        } else if (statusLower.includes('pending')) {
            return 'approval-pending';
        }
        return 'approval-none';
    }

    navigateToServiceRequest(event) {
        let recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Service_Request__c',
                actionName: 'view'
            }
        });
    }
 
    navigateToNewServiceRequest() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Service_Request__c',
                actionName: 'new'
            }
        });
    }

    showRecordTypeModal() {
        this.showModal = true;
    }

    closeModal() {
        this.showModal = false;
    }

    async selectRecordType(event) {
        const selectedRecordType = event.currentTarget.dataset.recordType;
        const recordTypeName = this.recordTypeMapping[selectedRecordType];
        
        try {

            const recordTypeId = await getRecordTypeIdByDeveloperName({ 
                objectApiName: 'Service_Request__c', 
                developerName: selectedRecordType 
            });


            this.showModal = false;


            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Service_Request__c',
                    actionName: 'new'
                },
                state: {
                    recordTypeId: recordTypeId,
                    //useRecordTypeCheck: 1
                    nooverride: '1'
                }
            });

        } catch (error) {
            console.error('Error getting record type:', error);
            this.closeModal();
            this.navigateToNewServiceRequest();
        }
    }
}