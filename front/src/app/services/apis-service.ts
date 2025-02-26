import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class ApisService {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  async post(url: string, input: any) {
    let jsonHeader = { 'Content-Type': 'application/json' };
    let authHeader = {};
    const user = this.authenticationService.userValue;
    const isLoggedIn = user?.token;
    if (isLoggedIn) {
      authHeader = {
        'Authorization': `Bearer ${user.token}`,
      };
    }
    const requestOptions = {
      method: 'POST',
      headers: { ...jsonHeader, ...authHeader },
      body: JSON.stringify(input),
    };
    return fetch(url, requestOptions)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error('Error: ' + response.status);
      })
      .catch((error) => {
        this.router.navigate(['/unauthorized']);
      })
      .then((data) => {
        return data;
      });
  }

  async get(url: string) {
    let authHeader = {};
    const user = this.authenticationService.userValue;
    const isLoggedIn = user?.token;
    if (isLoggedIn) {
        authHeader = {
        'Authorization': `Bearer ${user.token}`,
      };
    }

    const requestOptions = {
        method: 'GET',
        headers: {...authHeader },
      }
    return fetch(url, requestOptions)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        }
        throw new Error('Error: ' + response.status);
      })
      .catch((error) => {
        this.router.navigate(['/unauthorized']);
      })
      .then((data) => {
        return data;
      });
  }
}
