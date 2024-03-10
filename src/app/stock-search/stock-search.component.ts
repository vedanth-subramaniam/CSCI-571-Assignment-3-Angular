import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StockApiService} from "../stock-api.service";
import {Subscription, interval, switchMap, forkJoin} from 'rxjs';
@Component({
  selector: 'app-stock-search',
  standalone: true,
  imports: [
    FormsModule, HttpClientModule
  ],
  templateUrl: './stock-search.component.html',
  styleUrl: './stock-search.component.css'
})
export class StockSearchComponent implements OnInit, OnDestroy {

  tickerSymbol: string = '';
  private apiSubscription: Subscription | undefined;

  constructor(private stockService: StockApiService) {
  }

  ngOnInit(): void {
    console.log("Hey");
  }

  searchStock() {
    console.log('Searching for stock:', this.tickerSymbol);

    this.apiSubscription = interval(15000)
      .pipe(
        switchMap(() => forkJoin({
          companyCommonDetails: this.stockService.getCompanyCommonDetailsAPI(this.tickerSymbol),
          newsTabDetails: this.stockService.getNewsTabDetailsAPI(this.tickerSymbol),
          chartsTabDetails: this.stockService.getChartsTabDetailsAPI(this.tickerSymbol),
          insightsTabDetails: this.stockService.getInsightsTabDetailsAPI(this.tickerSymbol)
        }))
      )
      .subscribe({
        next: (responses) => {
          console.log('Company Common Details:', responses.companyCommonDetails);
          console.log('News Tab Details:', responses.newsTabDetails);
          console.log('Charts Tab Details:', responses.chartsTabDetails);
          console.log('Insights Tab Details:', responses.insightsTabDetails);
        },
        error: (error) => {
          console.error('Error in API calls:', error);
        }
      });
  }

  clearSearch() {
    this.tickerSymbol = '';
    // Implement the logic to clear out the currently searched  results and show the initial search page
  }

  ngOnDestroy() {
    console.log("Bye");
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
  }
}
