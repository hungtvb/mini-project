# Nexcent Site Initializer

This client extension provisions the `Next Gen Site` site from source on Liferay DXP 2026.Q2.8.

It creates:

- the `Nexcent Landing Master` master page;
- the public `Home` content page;
- the current Nexcent fragment collection;
- the current `Nexcent Default` Style Book.

The generated initializer source is built by the root Gradle task:

```bash
./gradlew prepareNexcentSiteInitializer
```

A clean environment should use:

```bash
./gradlew deploy
```

The initializer autoprovisions the site through the external reference code `NXC_NEXT_GEN_SITE`. The standalone `deployNexcentFragments` task is reserved for incrementally updating fragments on an already provisioned site.

For a complete clean runtime verification and downloadable deployment package, run:

```bash
bash scripts/liferay/full-setup-q2.sh
```
