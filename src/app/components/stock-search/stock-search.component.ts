import {Component, OnDestroy, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
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
import {AsyncPipe, DatePipe, NgForOf, NgIf, NgOptimizedImage, NgTemplateOutlet} from "@angular/common";
import {MatAutocomplete, MatAutocompleteTrigger, MatOption} from "@angular/material/autocomplete";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {auto} from "@popperjs/core";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {
  MatCard,
  MatCardContent,
  MatCardHeader, MatCardSmImage,
  MatCardSubtitle,
  MatCardTitle,
  MatCardTitleGroup
} from "@angular/material/card";
import {StockApiService} from "../../services/stock-api.service";
import {MatDialog} from "@angular/material/dialog";
import {NewsDetailsDialogComponent} from "../news-details-dialog/news-details-dialog.component";
import {StockStateService} from '../../services/stock-state.service';

@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule, ReactiveFormsModule, NgForOf, NgIf, MatAutocomplete, MatOption, AsyncPipe, MatFormField, MatAutocompleteTrigger, MatInput, DatePipe, NgOptimizedImage, MatTabGroup, MatTab, NgTemplateOutlet, MatCard, MatCardHeader, MatCardTitle, MatCardTitleGroup, MatCardContent, MatCardSubtitle, MatCardSmImage
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

  selectedIndex: number = 0;

  // References to the template elements
  @ViewChild('summaryTab') summaryTemplate!: TemplateRef<any>;
  @ViewChild('newsTab') newsTemplate!: TemplateRef<any>;
  @ViewChild('chartsTab') chartsTemplate!: TemplateRef<any>;
  @ViewChild('insightsTab') insightsTemplate!: TemplateRef<any>;

  constructor(private stockService: StockApiService, public dialog: MatDialog, protected stockStateService: StockStateService) {
  }

  ngOnInit() {

    console.log("Search component Init");
    const state = this.stockStateService.getState();
    console.log('State:', state);
    if (state) {
      this.tickerSymbol = state.tickerSymbol;
      this.companyInfoResponse = state.companyInfoResponse;
      this.companyPeers = state.companyPeers;
      this.latestPrice = state.latestPrice;
      this.stockProfile = state.stockProfile;
      this.newsResponse = state.newsResponse;
      this.chartResponse = state.chartResponse;
      this.insightsResponse = state.insightsResponse;
      this.currentTab = state.currentTab;
      this.stockSearchControl.setValue(state.searchInputValue);
    }
    this.autocompleteSearchResults = [];
    this.stockSearchControl.valueChanges.pipe(
      debounceTime(700), // Wait for 700ms pause in events
      distinctUntilChanged(), // Only emit when the current value is different from the last
      tap(() => this.autocompleteSearchResults = []), // Reset results on new search
      filter(value => value != null && value.trim() != ''), // Filter out empty or null values
      switchMap(value =>
        this.stockService.getAutocompleteAPI(value).pipe(
          catchError(error => {
            // Handle or log the error
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

  searchStock(searchInput: any) {

    this.stockSearchControl.setValue(searchInput);
    this.tickerSymbol = searchInput.toUpperCase();
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
            this.onStateChange();
            console.log('State changes inside company details', this.stockStateService.getState());
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

    this.stockService.getChartsTabDetailsAPI(this.tickerSymbol.toUpperCase()).subscribe({
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

    this.currentTab = "Summary";
    this.onStateChange();
    console.log('State changes', this.stockStateService.getState());
  }

  selectTab(index: number) {
    this.selectedIndex = index;
  }

  getTemplate() {
    switch (this.selectedIndex) {
      case 0:
        return this.summaryTemplate;
      case 1:
        return this.newsTemplate;
      case 2:
        return this.chartsTemplate;
      case 3:
        return this.insightsTemplate;
      default:
        return null;
    }
  }

  getMarketStatus() {
    const currentDate = new Date();
    const timestampDate = new Date(this.latestPrice?.t * 1000);

    const difference = currentDate.getTime() - timestampDate.getTime();

    return difference > (5 * 60 * 1000);
  }

  openDialog(newsDetail: any): void {
    this.dialog.open(NewsDetailsDialogComponent, {
      width: '250px',
      data: newsDetail
    });
  }

  onStateChange() {
    // When the state changes, save it to the service
    console.log("Current tab before saving state", this.currentTab);
    this.stockStateService.saveState({
      tickerSymbol: this.tickerSymbol,
      companyInfoResponse: this.companyInfoResponse,
      companyPeers: this.companyPeers,
      latestPrice: this.latestPrice,
      stockProfile: this.stockProfile,
      newsResponse: this.newsResponse,
      chartResponse: this.chartResponse,
      insightsResponse: this.insightsResponse,
      currentTab: this.currentTab,
      searchInputValue: this.stockSearchControl.value
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
    // Unsubscribe to prevent memory leaks
    // this.onStateChange();
    this.autocompleteSearchResults = [];
    this.subscriptions.unsubscribe();
  }

  protected readonly auto = auto;
  protected readonly console = console;
}

interface StockOption {
  displaySymbol: string;
  description: string;
}