import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getVehicles from '@salesforce/apex/VehicleQuery.getVehicles';

export default class VehicleView extends NavigationMixin(LightningElement) {
   
    vehicleToShow = [];

    @wire(getVehicles)
    vehicleHandler(response) {
        const { error, data } = response;
        if (data) {
            this.vehicleToShow = data.map(v => ({
                ...v,
                ExtendedWarrantyDisplay: v.Extended_Warranty__c ? 'Yes' : 'No',
                WarrantyEligibleDisplay: v.Warranty_Eligible__c ? 'Yes' : 'No',
                PurchaseYearDisplay: v.Purchase_Year__c ? new Date(v.Purchase_Year__c).getFullYear() : 'N/A'
            }));
        }
        if (error) {
            console.error('Error fetching vehicles:', error);
        }
    }

    navigateToVehicle(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Vehicle__c',
                actionName: 'view'
            }
        });
    }
 
    navigateToNewVehicle() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Vehicle__c',
                actionName: 'new'
            }
        });
    }
}