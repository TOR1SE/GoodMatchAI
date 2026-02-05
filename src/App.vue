<template>
  <div class="App">
    <Navbar v-if="showNavbar" />
    <main>
      <router-view />
    </main>
    <Footer v-if="showFooter" />
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
import Footer from './components/Footer.vue'

export default {
  name: 'App',
  components: {
    Navbar,
    Footer
  },
  computed: {
    showNavbar() {
      const noNavbarRoutes = ['/welcome', '/login', '/register']
      return !noNavbarRoutes.includes(this.$route.path)
    },
    showFooter() {
      const noFooterRoutes = ['/welcome', '/login', '/register']
      return !noFooterRoutes.includes(this.$route.path)
    }
  }
}
</script>

<style>
@import './App.css';
</style>