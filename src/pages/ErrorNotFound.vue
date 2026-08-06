<template>
  <div class="notfound flex flex-center">
    <div class="notfound-inner">
      <div class="code">404</div>
      <div class="title">Страница не найдена</div>
      <div class="subtitle">
        Возможно, раздел ещё в разработке или ссылка устарела.
      </div>

      <q-btn
        unelevated
        no-caps
        icon="home"
        label="На главную"
        class="home-btn q-mt-lg"
        color="primary"
        to="/"
      />
    </div>
  </div>
</template>

<style scoped>
.notfound {

  background: var(--app-bg);
  min-height: 100vh;
}

.notfound-inner {
  text-align: center;
  padding: 24px;
}

.code {
  font-size: 96px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: 2px;
  color: primary;
  opacity: 0.14;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: var(--app-ink);
  margin-top: -12px;
}

.subtitle {
  font-size: 13.5px;
  color: var(--app-ink-soft);
  margin-top: 8px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.home-btn {
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 8px 22px;
  transition: background 0.2s;
}

.home-btn:hover {
  background: var(--app-bg);
}
</style>
