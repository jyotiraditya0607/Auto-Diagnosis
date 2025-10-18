import { LightningElement, api } from 'lwc';

export default class HelloExperienceCloud extends LightningElement {
    // Expose a public property to be set in the builder.
    // Default values are provided.
    @api greeting = 'Hello';
    @api recipient = 'World';
}