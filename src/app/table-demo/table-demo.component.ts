import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, Table } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import * as Papa from 'papaparse';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-table-demo',
  standalone: true,
  imports: [CommonModule, TableModule, InputTextModule, FormsModule],
  templateUrl: './table-demo.component.html',
  styleUrls: ['./table-demo.component.css']
})
export class TableDemoComponent {

  @ViewChild('table') tableRef!: Table;

  dataset: any[] = [];         // Full dataset after file upload
  visibleData: any[] = [];     // Data currently displayed on screen
  columns: string[] = [];      // List of column headers
  rowsPerPage: number = 10;    // Pagination control
  editingRow: number | null = null;  // Currently editable row index

  // Handle file upload and parse data accordingly
  handleFileUpload(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const reader = new FileReader();

    // Common callback after parsing data
    const afterParse = (data: any[]) => {
      this.dataset = data;
      this.columns = data.length ? Object.keys(data[0]) : [];
      this.updateVisibleData();
    };

    // Handle CSV files using PapaParse
    if (fileExtension === 'csv') {
      reader.onload = () => {
        const results = Papa.parse(reader.result as string, {
          header: true,
          skipEmptyLines: true
        });
        afterParse(results.data);
      };
      reader.readAsText(file);
    }

    // Handle XLSX files using SheetJS
    else if (fileExtension === 'xlsx') {
      reader.onload = (e: any) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        afterParse(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }

    // Reject unsupported file types
    else {
      alert('Unsupported file format. Please upload a .csv or .xlsx file.');
    }
  }

  // Display only the selected number of rows
  updateVisibleData(): void {
    this.visibleData = this.dataset.slice(0, this.rowsPerPage);
  }

  // Update table when row limit changes
  onRowsPerPageChange(newValue: number): void {
    this.rowsPerPage = newValue;
    this.updateVisibleData();
  }

  // Enable row editing on right-click
  enableEdit(index: number, event: MouseEvent): void {
    event.preventDefault();
    this.editingRow = index;
  }

  // Save edits and exit edit mode
  saveEdit(): void {
    this.editingRow = null;
  }

  // Download visible data as a CSV file
  downloadCSV(): void {
    const csv = Papa.unparse(this.visibleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'exported-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter specific column based on input
  filterColumn(event: Event, field: string, table: Table) {
    const input = event.target as HTMLInputElement;
    table.filter(input.value, field, 'contains');
  }

  // Custom sort function for handling both numbers and strings
  customSort(event: any) {
    const field = event.field;
    const order = event.order;

    event.data.sort((a: any, b: any) => {
      const value1 = a[field];
      const value2 = b[field];

      const num1 = parseFloat(value1);
      const num2 = parseFloat(value2);
      const isNumber = !isNaN(num1) && !isNaN(num2);

      if (isNumber) {
        return order * (num1 - num2);
      } else {
        return order * value1.toString().localeCompare(value2.toString());
      }
    });
  }

  // Use browser speech recognition to fill cell values
  startVoiceRecognition(i: number, field: string): void {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      this.visibleData[i][field] = transcript;
    };

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event);
    };

    recognition.start();
  }
}
