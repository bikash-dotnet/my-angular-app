
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface ManagementId {
  id: string;
}

interface QmaData {
  srcsysid: string;
  product: string;
  region: string;
  market: string;
  managementid: ManagementId[];
  mnemonic: string[];
}

@Component({
  selector: 'app-form-tabs',
  imports: [FormsModule],
  templateUrl: './form-tabs.html',
  styleUrl: './form-tabs.scss'
})
export class FormTabs {

  qmaData: QmaData[] = [
    {
      srcsysid: "182719969A",
      product: "Cross Product",
      region: "Americas",
      market: "United Kingdom",
      managementid: [
        { id: "yuli" },
        { id: "mgmt20251021-001" },
        { id: "dasdadad" },
        { id: "6667" }
      ],
      mnemonic: []
    },
    {
      srcsysid: "987654321B",
      product: "Investment Banking",
      region: "Europe",
      market: "Germany",
      managementid: [
        { id: "admin1" },
        { id: "mgmt2024" }
      ],
      mnemonic: ["IB-EU", "GER-MAIN"]
    }
  ];

  addManagementId(itemIndex: number) {
    this.qmaData[itemIndex].managementid.push({ id: '' });
  }

  removeManagementId(itemIndex: number, mgmtIndex: number) {
    this.qmaData[itemIndex].managementid.splice(mgmtIndex, 1);
  }

  addMnemonic(itemIndex: number) {
    this.qmaData[itemIndex].mnemonic.push('');
  }

  removeMnemonic(itemIndex: number, mnemonicIndex: number) {
    this.qmaData[itemIndex].mnemonic.splice(mnemonicIndex, 1);
  }

  onSubmit() {
    console.log('Form submitted with data:', this.qmaData);
    alert('Data saved successfully! Check console for details.');
  }

  onCancel() {
    if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
      // Reset to original data
      this.qmaData = JSON.parse(JSON.stringify(this.originalData));
    }
  }

  // Store original data for cancel functionality
  private originalData: QmaData[] = JSON.parse(JSON.stringify(this.qmaData));

}
