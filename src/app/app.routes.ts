import {Routes} from '@angular/router';
import {StockSearchComponent} from "./stock-search/stock-search.component";
import {StockWishlistComponent} from "./stock-wishlist/stock-wishlist.component";
import {StockPortfolioComponent} from "./stock-portfolio/stock-portfolio.component";
import {StockHomeComponent} from "./stock-home/stock-home.component";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: StockHomeComponent},
  {path: 'search', component: StockSearchComponent},
  {path: 'search/:stockTicker', component: StockSearchComponent},
  {path: 'wishlist', component: StockWishlistComponent},
  {path: 'portfolio', component: StockPortfolioComponent}
];
