public with sharing class KnowledgeArticlesController {

    @AuraEnabled(cacheable=true)
    public static List<Knowledge__kav> getArticles(Integer recordLimit) {
        // Basic error handling
        if (recordLimit == null || recordLimit <= 0) {
            recordLimit = 5; // Default to 5 if the input is invalid
        }
        
        try {
            // Query for the most recently published online articles in English.
            // You can customize the WHERE clause for different languages or criteria.
            return [
                SELECT Id, Title, UrlName 
                FROM Knowledge__kav 
                WHERE PublishStatus = 'Online' AND Language = 'en_US'
                ORDER BY LastPublishedDate DESC
                LIMIT :recordLimit
            ];
        } catch (Exception e) {
            // In a real scenario, log the error for admins.
            throw new AuraHandledException('Error retrieving knowledge articles: ' + e.getMessage());
        }
    }
}