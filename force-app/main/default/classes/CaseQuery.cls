public with sharing class CaseQuery {
    @AuraEnabled(cacheable=true)
    public static List<Case> getCases() {
        try {
            return [
                    SELECT
                            Id,
                            CaseNumber,
                            Subject,
                            Status,
                            Priority,
                            Type,
                            Origin,
                            Description,
                            ContactId,
                            AccountId,
                            OwnerId,
                            CreatedDate,
                            ClosedDate,
                            Contact.Name,
                            Account.Name,
                            Owner.Name
                    FROM Case
                    ORDER BY CreatedDate DESC
                    LIMIT 50
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching cases: ' + e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Case getCaseById(Id caseId) {
        try {
            return [
                    SELECT
                            Id,
                            CaseNumber,
                            Subject,
                            Status,
                            Priority,
                            Type,
                            Origin,
                            Description,
                            ContactId,
                            AccountId,
                            OwnerId,
                            CreatedDate,
                            ClosedDate,
                            Contact.Name,
                            Account.Name,
                            Owner.Name
                    FROM Case
                    WHERE Id = :caseId
                    LIMIT 1
            ];
        } catch (Exception e) {
            throw new AuraHandledException('Error fetching case: ' + e.getMessage());
        }
    }
}