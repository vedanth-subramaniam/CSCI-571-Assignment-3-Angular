import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable, of} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StockApiService {

  host = "https://csci-570-a3-node-app-1.wm.r.appspot.com";
  constructor(private http: HttpClient) {
  }

  getAutocompleteAPI(stockVal: any) {
    return this.http.get(this.host + "/autoComplete/" + stockVal);
  }

  getCompanyCommonDetailsAPI(stockTicker: any) {
    return this.http.get(this.host + "/search/" + stockTicker);
  }

  getChartsHourlyDetailsAPI(stockTicker: any) {
    return this.http.get(this.host + "/chartsHourly/" + stockTicker);
  }

  getNewsTabDetailsAPI(stockTicker: any) {
    return this.http.get(this.host + "/news/" + stockTicker);
  }

  getChartsTabDetailsAPI(stockTicker: any) {
    return this.http.get(this.host + "/charts/" + stockTicker);
  }

  getInsightsTabDetailsAPI(stockTicker: any) {
    return this.http.get(this.host + "/insights/" + stockTicker)
  }

  getLatestStockPrice(stockTicker: any) {
    return this.http.get(this.host + "/latestPrice/" + stockTicker);
  }

  getAllFromWishlistDB(): Observable<any> {
    return this.http.get(this.host + "/getAllStocks");
  }

  getTickerWishListDB(stockTicker: any){
    return this.http.get(this.host + "/getStock/" + stockTicker);
  }
  postIntoWishListData(stockData:any) {
    return this.http.post(this.host + "/insertStockWishlist", stockData);
  }

  deleteFromWishlistDB(stockTicker: any) {
    console.log("Delete api in service");
    console.log(stockTicker);
    return this.http.get(this.host + "/deleteStockFromWishlist/" + stockTicker);
  }

  getPortfolioData(): Observable<any> {
    console.log("Get All from the Portfolio");
    return this.http.get(this.host + "/getAllPortfolioData");
  }

  postIntoPortfolioData(portfolioData:any) {
    return this.http.post(this.host + "/insertIntoPortfolio", portfolioData);
  }

  deleteFromPortfolioDB(stockTicker: any) {
    console.log("Delete Portfolio in service");
    return this.http.get(this.host + "/deleteFromPortfolio/" + stockTicker);
  }

  getSingleRecordPortfolioDB(stockTicker: any) {
    console.log("fetching portfolio records for single record");
    return this.http.get(this.host + "/getPortfolioData/" + stockTicker);
  }

  getWalletBalanceDB() {
    return this.http.get(this.host + "/wallet");
  }

  updateWalletBalanceDB(balance: any) {
    let walletBalance = {
      "balance": balance
    }
    return this.http.post(this.host + "/updateWalletBalance", walletBalance);
  }
}



