import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CampusItem, ItemMatch } from './item.model';
import { Observable } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class ItemsService {
  private readonly api = 'http://localhost:5000/api';
  constructor(private http: HttpClient) {}
  getItems(): Observable<CampusItem[]> { return this.http.get<CampusItem[]>(this.api + '/items'); }
  createItem(item: CampusItem): Observable<CampusItem> { return this.http.post<CampusItem>(this.api + '/items', item); }
  deleteItem(id: string): Observable<{ message: string }> { return this.http.delete<{ message: string }>(this.api + '/items/' + id); }
  getMatches(): Observable<ItemMatch[]> { return this.http.get<ItemMatch[]>(this.api + '/matches'); }
}
