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
        to="/"
      />
    </div>
  </div>
</template>

<style scoped>
.notfound {
  --steel: #2d4a7c;
  --steel-hover: #35568c;
  background: #f3f6fa;
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
  color: var(--steel);
  opacity: 0.14;
}

.title {
  font-size: 22px;
  font-weight: 600;
  color: #1d2b45;
  margin-top: -12px;
}

.subtitle {
  font-size: 13.5px;
  color: #6b7a90;
  margin-top: 8px;
  max-width: 320px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.5;
}

.home-btn {
  background: var(--steel);
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.3px;
  padding: 8px 22px;
  transition: background 0.2s;
}

.home-btn:hover {
  background: var(--steel-hover);
}
</style>
