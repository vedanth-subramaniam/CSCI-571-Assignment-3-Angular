import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {StockApiService} from "../stock-api.service";
import {Subscription, interval, switchMap, forkJoin, tap, startWith} from 'rxjs';

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
  private subscriptions: Subscription = new Subscription();

  constructor(private stockService: StockApiService) {
  }

  ngOnInit(): void {
    console.log("Hey");
  }

  searchStock() {
    console.log('Searching for stock:', this.tickerSymbol);

    const apiInterval$ = interval(15000).pipe(startWith(0));

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getCompanyCommonDetailsAPI(this.tickerSymbol).subscribe(
          response => console.log('Company Common Details:', response),
          error => console.error('Error fetching Company Common Details', error)
        ))
      ).subscribe()
    );

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getNewsTabDetailsAPI(this.tickerSymbol).subscribe(
          response => console.log('News Tab Details:', response),
          error => console.error('Error fetching News Tab Details', error)
        ))
      ).subscribe()
    );

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getChartsTabDetailsAPI(this.tickerSymbol).subscribe(
          response => console.log('Charts Tab Details:', response),
          error => console.error('Error fetching Charts Tab Details', error)
        ))
      ).subscribe()
    );

    this.subscriptions.add(
      apiInterval$.pipe(
        tap(() => this.stockService.getInsightsTabDetailsAPI(this.tickerSymbol).subscribe(
          response => console.log('Insights Tab Details:', response),
          error => console.error('Error fetching Insights Tab Details', error)
        ))
      ).subscribe()
    );
  }

  clearSearch() {
    this.tickerSymbol = '';
    this.subscriptions.unsubscribe();
    // Implement the logic to clear out the currently searched  results and show the initial search page
  }

  ngOnDestroy() {
    console.log("Bye");
    this.subscriptions.unsubscribe();
  }
}
