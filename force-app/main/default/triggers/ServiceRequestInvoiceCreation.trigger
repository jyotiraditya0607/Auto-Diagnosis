trigger ServiceRequestInvoiceCreation on Service_Request__c (after update) {

    
    if(Trigger.isAfter && Trigger.isUpdate) {
    	ServiceRequestInvoiceCreationHandler.handleActivityAfterUpdate(Trigger.NEW);
    }
}