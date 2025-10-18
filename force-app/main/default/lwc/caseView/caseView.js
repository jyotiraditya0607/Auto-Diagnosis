import { LightningElement, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getCases from '@salesforce/apex/CaseQuery.getCases';

export default class CaseView extends NavigationMixin(LightningElement) {

    caseToShow = [];

    @wire(getCases)
    caseHandler(response) {
        const { error, data } = response;
        if (data) {
            this.caseToShow = data.map(c => ({
                ...c,
                CreatedDateDisplay: c.CreatedDate ? new Date(c.CreatedDate).toLocaleDateString() : 'N/A',
                ClosedDateDisplay: c.ClosedDate ? new Date(c.ClosedDate).toLocaleDateString() : 'N/A',
                ContactName: c.Contact ? c.Contact.Name : 'N/A',
                AccountName: c.Account ? c.Account.Name : 'N/A',
                OwnerName: c.Owner ? c.Owner.Name : 'N/A',
                StatusClass: this.getStatusClass(c.Status),
                PriorityClass: this.getPriorityClass(c.Priority),
                SubjectDisplay: c.Subject || 'No Subject',
                DescriptionPreview: c.Description ? (c.Description.length > 60 ? c.Description.substring(0, 60) + '...' : c.Description) : 'No description available',
                TypeDisplay: c.Type || 'N/A',
                OriginDisplay: c.Origin || 'N/A'
            }));
        }
        if (error) {
            console.error('Error fetching cases:', error);
        }
    }

    navigateToCase(event) {
        const recordId = event.currentTarget.dataset.id;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case',
                actionName: 'view'
            }
        });
    }

    navigateToNewCase() {
        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case',
                actionName: 'new'
            }
        });
    }

    getStatusClass(status) {
        switch(status?.toLowerCase()) {
            case 'new':
                return 'status-new';
            case 'in progress':
            case 'working':
                return 'status-working';
            case 'closed':
                return 'status-closed';
            case 'escalated':
                return 'status-escalated';
            case 'on hold':
                return 'status-onhold';
            default:
                return 'status-default';
        }
    }

    getPriorityClass(priority) {
        switch(priority?.toLowerCase()) {
            case 'high':
                return 'priority-high';
            case 'medium':
                return 'priority-medium';
            case 'low':
                return 'priority-low';
            default:
                return 'priority-default';
        }
    }
}