# RestClient vs WebClient




## Table of Contents

- [Definition](#definition)
- [Blocking vs Non-Blocking](#blocking-vs-non-blocking)
- [When to Use](#when-to-use)
- [Example (RestClient)](#example-restclient)
- [Example (WebClient)](#example-webclient)
- [Summary](#summary)


---

## Definition

- **RestClient**: modern synchronous HTTP client (Spring 6), replacement for `RestTemplate`.
- **WebClient**: non-blocking reactive HTTP client (Spring WebFlux).

## Blocking vs Non-Blocking

- RestClient is blocking and works with classic MVC.
- WebClient is non-blocking and works with reactive pipelines.

## When to Use

- RestClient: simple sync calls, existing MVC apps, easier debugging.
- WebClient: reactive stacks, high concurrency, streaming responses.

## Example (RestClient)

```java
RestClient client = RestClient.create("http://users");
User user = client.get()
  .uri("/1")
  .retrieve()
  .body(User.class);
```

## Example (WebClient)

```java
WebClient client = WebClient.create("http://users");
Mono<User> user = client.get()
  .uri("/1")
  .retrieve()
  .bodyToMono(User.class);
```

## Summary

- RestClient is synchronous and simpler.
- WebClient is reactive and scalable for non-blocking workloads.
