import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StockApiService} from "../stock-api.service";
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  interval, of,
  startWith,
  Subscription,
  switchMap,
  tap
} from "rxjs";
import {AsyncPipe, DatePipe, NgForOf, NgIf, NgOptimizedImage} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {auto} from "@popperjs/core";
import {Router} from "express";
import {ActivatedRoute, RouterLink} from "@angular/router";

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule, ReactiveFormsModule, NgForOf, NgIf, MatAutocomplete, MatOption, AsyncPipe, MatFormField, MatAutocompleteTrigger, MatInput, DatePipe, NgOptimizedImage, RouterLink
  ],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit, OnDestroy {

  tickerSymbol: string = '';
  private subscriptions: Subscription = new Subscription();
  stockSearchControl = new FormControl();
  autocompleteSearchResults: StockOption[] = [];

  currentTab = "";

  companyInfoResponse!: any;
  companyPeers: any;
  latestPrice: any;
  stockProfile: any;

  newsResponse!: any;
  chartResponse!: any;
  insightsResponse!: any;

  constructor(private stockService: StockApiService, private route: ActivatedRoute) {
  }

  ngOnInit() {

    const routeParams = this.route.snapshot.paramMap;
    const stockTickerFromRoute = String(routeParams.get('stockTicker'));

    this.tickerSymbol = this.stockSearchControl.value;
    this.searchStock(stockTickerFromRoute);

    console.log("Search page");
    console.log(stockTickerFromRoute);
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

  searchStock(stockInput: any) {

    this.tickerSymbol = stockInput;
    console.log('Searching for stock:', this.tickerSymbol);

    const apiInterval$ = interval(15000).pipe(startWith(0));

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getCompanyCommonDetailsAPI(this.tickerSymbol).subscribe(
          (response) => {
            this.companyInfoResponse = response;
            console.log('Company Common Details:', this.companyInfoResponse);
            this.stockProfile = this.companyInfoResponse.stockProfile;
            this.latestPrice = this.companyInfoResponse.latestPrice;
            this.companyPeers = this.companyInfoResponse.companyPeers;
            this.currentTab = "Summary";
          },
          error => console.error('Error fetching Company Common Details', error)
        ))
      ).subscribe()
    );

    this.stockService.getNewsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        this.newsResponse = response;
        console.log('News Tab Details:', this.newsResponse);
      }
    });

    this.stockService.getChartsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        this.chartResponse = response;
        console.log('Charts Tab Details:', this.chartResponse);
      }
    });

    this.stockService.getInsightsTabDetailsAPI(this.tickerSymbol).subscribe({
      next: (response: any) => {
        this.insightsResponse = response;
        console.log('Insights Tab Details:', this.insightsResponse);
      }
    });

  }

  clearSearch() {
    console.log("Clear search");
    this.stockSearchControl.reset();
    this.tickerSymbol = '';
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
    this.currentTab = "";
  }

  ngOnDestroy() {
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
  }

  protected readonly auto = auto;
}

interface StockOption {
  displaySymbol: string;
  description: string;
}
