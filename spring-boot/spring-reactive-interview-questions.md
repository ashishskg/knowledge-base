Spring Reactive Interview Questions (10+ Years) with Coding Examples

1) Explain backpressure and how Reactor handles it
Answer:
Backpressure is a mechanism to prevent a fast producer from overwhelming a slow consumer.
Reactor implements it via Reactive Streams (request n items). Operators like onBackpressureBuffer,
limitRate, and backpressure-aware sources handle demand.

Example (limit rate)
```
Flux.range(1, 100)
  .limitRate(10)
  .doOnRequest(n -> System.out.println("requested: " + n))
  .subscribe(System.out::println);
```

2) Difference between hot and cold publishers
Answer:
Cold publishers start emitting per subscriber; hot publishers share emissions.

Example
```
Flux<Long> cold = Flux.interval(Duration.ofMillis(200)).take(3);
Flux<Long> hot = cold.share(); // hot

hot.subscribe(v -> System.out.println("A " + v));
Thread.sleep(300);
hot.subscribe(v -> System.out.println("B " + v));
```

3) Explain Mono vs Flux and when to use each
Answer:
Mono for 0..1, Flux for 0..N. Use Mono for single object or empty, Flux for streams.

Example
```
Mono<User> userMono = userRepo.findById("1");
Flux<User> usersFlux = userRepo.findAll();
```

4) How do you handle errors in a reactive pipeline?
Answer:
Use onErrorReturn, onErrorResume, doOnError, retry, and circuit breakers.

Example
```
userService.getUser("1")
  .onErrorResume(ex -> Mono.just(new User("fallback")))
  .subscribe();
```

5) How do you make blocking calls safe in WebFlux?
Answer:
Wrap blocking code in Mono.fromCallable and run on boundedElastic.

Example
```
Mono.fromCallable(() -> blockingRepo.findById("1"))
  .subscribeOn(Schedulers.boundedElastic());
```

6) Explain Reactor Context and use cases
Answer:
Context is immutable metadata per subscriber, good for tracing, auth, or correlation ids.

Example
```
Mono.deferContextual(ctx -> Mono.just(ctx.get("traceId")))
  .contextWrite(Context.of("traceId", "t-123"))
  .subscribe(System.out::println);
```

7) How do you combine multiple async calls?
Answer:
Use zip for parallel composition, flatMap for dependent flows.

Example (zip)
```
Mono<User> user = userService.getUser("1");
Mono<List<Order>> orders = orderService.getOrders("1");

Mono.zip(user, orders)
  .map(tuple -> new UserSummary(tuple.getT1(), tuple.getT2()))
  .subscribe();
```

8) What is the difference between map and flatMap?
Answer:
map transforms values; flatMap flattens async/publisher results.

Example
```
Flux.just("a", "b")
  .map(String::toUpperCase)
  .subscribe();

Flux.just("a", "b")
  .flatMap(s -> Mono.just(s.toUpperCase()))
  .subscribe();
```

9) How do you control concurrency in flatMap?
Answer:
Use flatMap with concurrency and prefetch parameters.

Example
```
Flux.range(1, 100)
  .flatMap(i -> remoteCall(i), 8) // max 8 concurrent
  .subscribe();
```

10) How do you test reactive flows?
Answer:
Use StepVerifier for deterministic verification.

Example
```
StepVerifier.create(Flux.just(1, 2, 3))
  .expectNext(1, 2, 3)
  .verifyComplete();
```

11) Explain Scheduler types and use cases
Answer:
Schedulers.parallel for CPU-bound, boundedElastic for blocking I/O, immediate for inline execution.

Example
```
Flux.range(1, 10)
  .publishOn(Schedulers.parallel())
  .map(i -> i * 2)
  .subscribe();
```

12) How do you handle timeouts and retries?
Answer:
Use timeout and retryWhen with backoff.

Example
```
Mono.fromCallable(() -> externalCall())
  .timeout(Duration.ofSeconds(1))
  .retryWhen(Retry.backoff(3, Duration.ofMillis(100)))
  .subscribe();
```

13) Explain backpressure strategies
Answer:
onBackpressureBuffer buffers, onBackpressureDrop drops, onBackpressureLatest keeps latest.

Example
```
Flux.interval(Duration.ofMillis(10))
  .onBackpressureDrop()
  .publishOn(Schedulers.boundedElastic())
  .subscribe();
```

14) How do you integrate WebFlux with R2DBC?
Answer:
Use Spring Data R2DBC repositories to avoid blocking I/O.

Example
```
public interface UserRepo extends ReactiveCrudRepository<User, String> {}
```

15) Explain difference between WebClient and RestTemplate
Answer:
WebClient is non-blocking reactive, RestTemplate is blocking and deprecated for new code.

Example
```
WebClient client = WebClient.create("http://users");
Mono<User> u = client.get().uri("/1").retrieve().bodyToMono(User.class);
```

16) How to apply security in WebFlux?
Answer:
Use SecurityWebFilterChain and reactive security APIs.

Example
```
@Bean
SecurityWebFilterChain springSecurity(ServerHttpSecurity http) {
  return http
    .authorizeExchange(ex -> ex.anyExchange().authenticated())
    .oauth2ResourceServer(ServerHttpSecurity.OAuth2ResourceServerSpec::jwt)
    .build();
}
```

17) What is the difference between concatMap and flatMap?
Answer:
concatMap preserves order by waiting; flatMap is concurrent and unordered by default.

Example
```
Flux.just(1, 2, 3)
  .concatMap(i -> Mono.just(i).delayElement(Duration.ofMillis(50)))
  .subscribe();
```

18) How do you debug reactive pipelines?
Answer:
Use log(), doOnNext, checkpoint, and Reactor debug agent.

Example
```
Flux.just("a", "b")
  .doOnNext(v -> System.out.println("val=" + v))
  .checkpoint("after-transform")
  .subscribe();
```

19) Explain cold-to-hot conversion patterns
Answer:
share() or publish().refCount() convert cold to hot.

Example
```
Flux<Long> hot = Flux.interval(Duration.ofMillis(100)).publish().refCount(1);
```

20) How do you handle context propagation (tracing) in WebFlux?
Answer:
Use Reactor Context and Micrometer Tracing / OpenTelemetry.

Example
```
Mono.deferContextual(ctx -> Mono.just(ctx.get("traceId")))
  .contextWrite(Context.of("traceId", "trace-1"))
  .subscribe();
```
