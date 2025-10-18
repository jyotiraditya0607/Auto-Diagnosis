public with sharing class InvoiceQuery {
    @AuraEnabled(cacheable=true)
    public static List<Invoicee__c> getInvoices() {
        try {
            return [
                    SELECT
                            Id,
                            Name,
                            Client__c,
                            Client_Name__c,
                            Due_Date__c,
                            Invoice_Date__c,
                            Labour_Cost__c,
                            Part_Cost__c,
                            Discount__c,
                            Tax__c,
                            Total_Amount__c,
                            Payment_Method__c,
                            Status__c,
                            Service_Type__c,
                            Service_Request__c,
                            Technician__c,
                            Vehicle__c,
                            Client__r.Name,
                            Service_Request__r.Name,
                            Technician__r.Name,
                            Vehicle__r.Name
                    FROM Invoicee__c
                    ORDER BY CreatedDate DESC
                    LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching invoices: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Invoicee__c getInvoiceById(Id invoiceId) {
        try {
            return [
                    SELECT
                            Id,
                            Name,
                            Client__c,
                            Client_Name__c,
                            Due_Date__c,
                            Invoice_Date__c,
                            Labour_Cost__c,
                            Part_Cost__c,
                            Discount__c,
                            Tax__c,
                            Total_Amount__c,
                            Payment_Method__c,
                            Status__c,
                            Service_Type__c,
                            Service_Request__c,
                            Technician__c,
                            Vehicle__c,
                            Client__r.Name,
                            Service_Request__r.Name,
                            Technician__r.Name,
                            Vehicle__r.Name
                    FROM Invoicee__c
                    WHERE Id = :invoiceId
                    LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching invoice: ' + e.getMessage());
        }
    }
}