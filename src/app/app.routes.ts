import { Routes } from '@angular/router';
import { Listing } from './listing/listing';
import { FormTabs } from './form-tabs/form-tabs';

export const routes: Routes = [
	{ path: 'listing', component: Listing },
	{ path: 'formtab', component: FormTabs },	
];
