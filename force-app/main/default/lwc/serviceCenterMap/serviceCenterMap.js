import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class ServiceCenterMap extends LightningElement {
    @track serviceCenters = [
        {
            id: '1',
            name: 'Downtown Service Center',
            address: 'Kaithalapur Flyover Rd, KPHB Phase 15, Kukatpally, Hyderabad, Telangana 500018',
            phone: '+91 9876543210',
            email: 'maintown@autodiagnosis.com',
            hours: '9:00 AM - 7:00 PM',
            services: 'Oil Change, Brake Service, Engine Repair, AC Service',
            status: 'Active',
            latitude: 17.463833,
            longitude: 78.398441,
            distance: '2.5 km away'
        },
        {
            id: '2', 
            name: 'Highway Service Center',
            address: 'NH-6, Burla, Sambalpur, Odisha 768018',
            phone: '+91 9876543211',
            email: 'highway@autodiagnosis.com',
            hours: '8:00 AM - 8:00 PM',
            services: 'Complete Vehicle Service, Tyre Change, Battery Service',
            status: 'Inactive',
            latitude: 21.5041,
            longitude: 83.9712,
            distance: '8.2 km away'
        }
    ];

    @track mapMarkers = [];
    @track mapCenter = {
        location: {
            Latitude: 21.4735,  
            Longitude: 83.9739
        }
    };

    connectedCallback() {
        this.createMapMarkers();
        this.setStatusClasses();
    }

    get serviceCentersCount() {
        return this.serviceCenters.length;
    }

    setStatusClasses() {
        this.serviceCenters = this.serviceCenters.map(center => ({
            ...center,
            statusClass: this.getStatusClass(center.status)
        }));
    }

    getStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'active':
                return 'status-badge status-active';
            case 'inactive':
                return 'status-badge status-inactive';
            case 'maintenance':
                return 'status-badge status-maintenance';
            default:
                return 'status-badge status-default';
        }
    }

    createMapMarkers() {
        this.mapMarkers = this.serviceCenters.map(center => ({
            location: {
                Latitude: center.latitude,
                Longitude: center.longitude
            },
            title: center.name,
            description: `${center.address}<br/>
                         Phone: ${center.phone}<br/>
                         Hours: ${center.hours}`,
            icon: 'custom:custom19'
        }));
    }

    selectServiceCenter(event) {
        const centerId = event.currentTarget.dataset.id;
        const center = this.serviceCenters.find(c => c.id === centerId);
        
        if (center) {
            // Update map center to selected service center
            this.mapCenter = {
                location: {
                    Latitude: center.latitude,
                    Longitude: center.longitude
                }
            };
            
            this.showToast('Service Center Selected', `${center.name} location centered on map`, 'success');
        }
    }

    getDirections(event) {
        const latitude = event.currentTarget.dataset.lat;
        const longitude = event.currentTarget.dataset.lng;
        
        // Open Google Maps with directions
        const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        window.open(url, '_blank');
        
        this.showToast('Directions', 'Opening Google Maps for directions', 'info');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }
}