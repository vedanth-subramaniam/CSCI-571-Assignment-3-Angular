import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {StockWishlistComponent} from "./stock-wishlist/stock-wishlist.component";
import {StockPortfolioComponent} from "./stock-portfolio/stock-portfolio.component";
import {StockSearchComponent} from "./stock-search/stock-search.component";
import {NgIf, NgSwitch} from "@angular/common";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, StockWishlistComponent, StockPortfolioComponent, StockSearchComponent, NgIf, NgbModule, RouterLink, NgSwitch, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'CSCI-571-Assignment-3-Angular';
  showComponent: 'search' | 'wishlist' | 'portfolio' = 'search';
}
