import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class CarServiceEstimator extends LightningElement {
    @track engineServices = [
        { id: 'eng-001', name: 'Oil Change (Mineral)', price: 1500, selected: false },
        { id: 'eng-002', name: 'Oil Change (Synthetic)', price: 3500, selected: false },
        { id: 'eng-003', name: 'Air Filter Replacement', price: 800, selected: false },
        { id: 'eng-004', name: 'Fuel Filter Replacement', price: 1200, selected: false },
        { id: 'eng-005', name: 'Spark Plugs Replacement (Set of 4)', price: 2500, selected: false },
        { id: 'eng-006', name: 'Coolant Top-up', price: 600, selected: false },
    ];

    @track brakeServices = [
        { id: 'brk-001', name: 'Brake Pads Replacement (Front)', price: 4500, selected: false },
        { id: 'brk-002', name: 'Brake Pads Replacement (Rear)', price: 4000, selected: false },
        { id: 'brk-003', name: 'Brake Fluid Replacement', price: 900, selected: false },
        { id: 'brk-004', name: 'Brake Disc Skimming (Front)', price: 1800, selected: false }
    ];

    @track transmissionServices = [
        { id: 'trn-001', name: 'Transmission Fluid Change', price: 3000, selected: false },
        { id: 'trn-002', name: 'Clutch Assembly Replacement', price: 15000, selected: false },
    ];

    @track electricalServices = [
        { id: 'elc-001', name: 'Battery Replacement (New)', price: 5500, selected: false },
        { id: 'elc-002', name: 'Alternator Repair', price: 6000, selected: false },
        { id: 'elc-003', name: 'Headlight Bulb Replacement (Pair)', price: 750, selected: false },
    ];

    @track maintenanceServices = [
        { id: 'mnt-001', name: 'Tire Rotation', price: 500, selected: false },
        { id: 'mnt-002', name: 'Wheel Alignment & Balancing', price: 1200, selected: false },
        { id: 'mnt-003', name: 'Windshield Wiper Blades (Pair)', price: 950, selected: false },
        { id: 'mnt-004', name: 'General Safety Inspection', price: 700, selected: false }
    ];

    // Combines all services into one array for easier filtering
    get allServices() {
        return [
            ...this.engineServices,
            ...this.brakeServices,
            ...this.transmissionServices,
            ...this.electricalServices,
            ...this.maintenanceServices
        ];
    }

    // Filters to get only the selected services
    get selectedServicesList() {
        return this.allServices.filter(service => service.selected);
    }

    // Checks if any service is selected
    get hasSelectedServices() {
        return this.selectedServicesList.length > 0;
    }

    // Calculates subtotal from selected services
    get subtotal() {
        return this.selectedServicesList.reduce((total, service) => total + service.price, 0).toFixed(2);
    }

    // Calculates tax based on subtotal
    get taxAmount() {
        return (parseFloat(this.subtotal) * 0.18).toFixed(2); // 18% GST
    }

    // Calculates a tiered labor cost
    get laborCost() {
        const selectedCount = this.selectedServicesList.length;
        if (selectedCount === 0) return '0.00';
        if (selectedCount <= 2) return '500.00';
        if (selectedCount <= 4) return '1000.00';
        return '1500.00';
    }

    // Calculates the final total cost
    get totalCost() {
        const subtotal = parseFloat(this.subtotal);
        const tax = parseFloat(this.taxAmount);
        const labor = parseFloat(this.laborCost);
        return (subtotal + tax + labor).toFixed(2);
    }

    // Disables the quote button if no services are selected
    get isQuoteDisabled() {
        return !this.hasSelectedServices;
    }

    // Handles checkbox changes
    handleServiceSelection(event) {
        const serviceId = event.target.value;
        const isChecked = event.target.checked;

        // Find and update the service in the appropriate array
        this.engineServices = this.updateServiceInArray(this.engineServices, serviceId, isChecked);
        this.brakeServices = this.updateServiceInArray(this.brakeServices, serviceId, isChecked);
        this.transmissionServices = this.updateServiceInArray(this.transmissionServices, serviceId, isChecked);
        this.electricalServices = this.updateServiceInArray(this.electricalServices, serviceId, isChecked);
        this.maintenanceServices = this.updateServiceInArray(this.maintenanceServices, serviceId, isChecked);
    }

    // Helper function to update the 'selected' property immutably
    updateServiceInArray(serviceArray, serviceId, isSelected) {
        return serviceArray.map(service => {
            if (service.id === serviceId) {
                return { ...service, selected: isSelected };
            }
            return service;
        });
    }

    // Clears all selected checkboxes
    clearAllSelections() {
        this.engineServices = this.engineServices.map(s => ({ ...s, selected: false }));
        this.brakeServices = this.brakeServices.map(s => ({ ...s, selected: false }));
        this.transmissionServices = this.transmissionServices.map(s => ({ ...s, selected: false }));
        this.electricalServices = this.electricalServices.map(s => ({ ...s, selected: false }));
        this.maintenanceServices = this.maintenanceServices.map(s => ({ ...s, selected: false }));

        this.showToast('Success', 'All selections have been cleared.', 'success');
    }

    // Generates a confirmation toast message
    generateQuote() {
        if (!this.hasSelectedServices) {
            this.showToast('Warning', 'Please select at least one service.', 'warning');
            return;
        }

        const serviceCount = this.selectedServicesList.length;
        const message = `Quote generated for ${serviceCount} service(s) totaling ₹${this.totalCost}. Our team will contact you soon!`;

        this.showToast('Quote Generated!', message, 'success');
    }

    // Helper function to display toast notifications
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            })
        );
    }
}