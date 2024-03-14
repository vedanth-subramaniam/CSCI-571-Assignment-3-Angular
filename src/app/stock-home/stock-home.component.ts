import {Component, OnInit} from '@angular/core';
import {auto} from "@popperjs/core";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatInput} from "@angular/material/input";
import {StockApiService} from "../stock-api.service";
import {catchError, debounceTime, distinctUntilChanged, filter, of, Subscription, switchMap, tap} from "rxjs";
import {ActivatedRoute, RouterLink} from "@angular/router";

@Component({
  selector: 'app-stock-home',
  standalone: true,
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatInput,
    MatOption,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './stock-home.component.html',
  styleUrl: './stock-home.component.css'
})
export class StockHomeComponent implements OnInit {

  private subscriptions: Subscription = new Subscription();
  stockSearchControl = new FormControl();
  autocompleteSearchResults: StockOption[] = [];
  tickerSymbol: any;

  constructor(private stockService: StockApiService, private route: ActivatedRoute) {
  }

  ngOnInit() {

    console.log("Home component init");
    this.autocompleteSearchResults = [];
    this.stockSearchControl.valueChanges.pipe(
      debounceTime(700), // Wait for 700ms pause in events
      distinctUntilChanged(), // Only emit when the current value is different from the last
      tap(() => this.autocompleteSearchResults = []), // Reset results on new search
      filter(value => value != null && value.trim() != ''), // Filter out empty or null values
      switchMap(value =>
        this.stockService.getAutocompleteAPI(value).pipe(
          catchError(error => {
            console.error('Error fetching autocomplete results:', error);
            return of([]); // Return an empty array or appropriate fallback value on error
          })
        )
      )
    ).subscribe((results: any) => {
      console.log("Autocomplete results:", results.result);
      this.autocompleteSearchResults = results.result;
      this.autocompleteSearchResults = this.autocompleteSearchResults.filter(option => !option.displaySymbol.includes('.'));
    });
  }

  searchStock() {
    this.tickerSymbol = this.stockSearchControl.value;
  }

  clearSearch() {
    this.tickerSymbol = '';
    this.autocompleteSearchResults = [];
    this.stockSearchControl.reset();
  }

  protected readonly auto = auto;
}

interface StockOption {
  displaySymbol: string;
  description: string;
}
