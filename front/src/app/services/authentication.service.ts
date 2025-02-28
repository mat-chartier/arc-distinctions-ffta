import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { User } from '../model/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private userSubject: BehaviorSubject<User | null>;
  public user: Observable<User | null>;
  private loggedInArcher: User | null = null;

  constructor(private router: Router) {
    this.userSubject = new BehaviorSubject(
      JSON.parse(localStorage.getItem('user')!)
    );
    this.user = this.userSubject.asObservable();
  }

  public get userValue() {
    return this.userSubject.value;
  }

  async login(noLicence: string, password: string): Promise<User | null> {

    let url = 'apis/users/authenticate';
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noLicence, password }),
    };
    await fetch(url, requestOptions)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error('Licence et/ou mot de passe incorrect');
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem('user', JSON.stringify(data));
        this.userSubject.next(data);
        this.loggedInArcher = data;
      });

    return this.loggedInArcher;
  }

  logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }
}
