public with sharing class FeedbackQuery {
    @AuraEnabled(cacheable=true)
    public static List<Feedback__c> getFeedbacks() {
        try {
            return [
                    SELECT
                            Id,
                            Name,
                            Feedback__c,
                            Rating__c,
                            Satisfied__c,
                            Feedback_Date__c,
                            Contact__c,
                            Service_Request__c,
                            Technician__c,
                            Contact__r.Name,
                            Service_Request__r.Name,
                            Technician__r.Name
                    FROM Feedback__c
                    ORDER BY CreatedDate DESC
                    LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching feedbacks: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Feedback__c getFeedbackById(Id feedbackId) {
        try {
            return [
                    SELECT
                            Id,
                            Name,
                            Feedback__c,
                            Rating__c,
                            Satisfied__c,
                            Feedback_Date__c,
                            Contact__c,
                            Service_Request__c,
                            Technician__c,
                            Contact__r.Name,
                            Service_Request__r.Name,
                            Technician__r.Name
                    FROM Feedback__c
                    WHERE Id = :feedbackId
                    LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching feedback: ' + e.getMessage());
        }
    }
}