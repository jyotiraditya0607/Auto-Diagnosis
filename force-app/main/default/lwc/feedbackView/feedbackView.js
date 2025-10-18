import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getFeedbacks from '@salesforce/apex/FeedbackQuery.getFeedbacks';

export default class FeedbackView extends NavigationMixin(LightningElement) {

    feedbackToShow = [];

    @wire(getFeedbacks)
    feedbackHandler(response) {
        const { error, data } = response;
        if (data) {
            this.feedbackToShow = data.map(f => ({
                ...f,
                SatisfiedDisplay: f.Satisfied__c ? 'Satisfied' : 'Not Satisfied',
                SatisfiedClass: f.Satisfied__c ? 'satisfied-yes' : 'satisfied-no',
                RatingDisplay: f.Rating__c ? f.Rating__c.toString() : '0',
                RatingStars: this.getRatingStars(f.Rating__c),
                FeedbackDateDisplay: f.Feedback_Date__c ? new Date(f.Feedback_Date__c).toLocaleDateString() : 'N/A',
                ContactName: f.Contact__r ? f.Contact__r.Name : 'N/A',
                ServiceRequestName: f.Service_Request__r ? f.Service_Request__r.Name : 'N/A',
                TechnicianName: f.Technician__r ? f.Technician__r.Name : 'N/A',
                FeedbackPreview: f.Feedback__c ? (f.Feedback__c.length > 50 ? f.Feedback__c.substring(0, 50) + '...' : f.Feedback__c) : 'No feedback provided'
            }));
        }
        if (error) {
            console.error('Error fetching feedbacks:', error);
        }
    }

    navigateToFeedback(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Feedback__c',
                actionName: 'view'
            }
        });
    }

    navigateToNewFeedback() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Feedback__c',
                actionName: 'new'
            }
        });
    }

    getRatingStars(rating) {
        const stars = [];
        const ratingValue = parseInt(rating) || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push({
                id: i,
                cssClass: i <= ratingValue ? 'star-filled' : 'star-empty'
            });
        }
        return stars;
    }
}