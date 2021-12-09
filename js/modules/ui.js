/////////////////////////////////////// CLASS UI ///////////////////////////////////////

class UI {

    startUI () {
        this.setPageNavigation();
        this.setSlider();
        this.setYear();
    }

    setPageNavigation () {
        const navBar = document.querySelector('nav');
        const navMenu = document.querySelector('.nav-menu');
        const menuToggleBtn = document.querySelector('.nav-menu-toggle-btn');
        const sctollLinks = [...document.querySelectorAll('.scroll-link')];

        menuToggleBtn.addEventListener('click', () => {
            menuToggleBtn.classList.toggle('anim');
            if (menuToggleBtn.classList.contains('anim')) {
                let menuHeight = 0;
                navMenu.querySelectorAll('a').forEach(elem => menuHeight += elem.offsetHeight);
                navMenu.style.height = `${menuHeight}px`;                
            } else {
                navMenu.style.height = '';
            }
        });

        sctollLinks.forEach(link => link.addEventListener('click', event => {
            event.preventDefault();
            if (menuToggleBtn.classList.contains('anim')) menuToggleBtn.click();        
            const id = event.currentTarget.getAttribute('href').slice(1);
            const elem = document.getElementById(id);
            const position = elem.offsetTop - navBar.offsetHeight;
            window.scrollTo(0, position);
        }));
    }

    setSlider () {
        const leftSliderBtn = document.querySelector('.left-slider-btn');
        const rightSliderBtn = document.querySelector('.right-slider-btn');
        const slides = document.querySelectorAll('.slide');
        let step = 0;
        // Set slides position
        slides.forEach((slide, index) => slide.style.left = `${index * 100}%`);
        // Assign listeners to slider btns 
        rightSliderBtn.addEventListener('click', () => {
            step++;
            if (step > slides.length - 1) step = 0;
            slides.forEach(slide => slide.style.transform = `translateX(-${step * 100}%)`);
        });
        leftSliderBtn.addEventListener('click', () => {
            step--;
            if (step < 0) step = slides.length - 1;
            slides.forEach(slide => slide.style.transform = `translateX(-${step * 100}%)`);
        });
    }

    setYear () {
        const year = new Date().getFullYear();
        document.querySelector('.date').textContent = year;
    }

    static hidePreloader () {
        const preloader = document.querySelector(".preloader");
        setTimeout(() => {
            preloader.classList.add("hide");
            preloader.addEventListener('transitionend', () => preloader.remove());
        }, 500);
    }

}

export default UI;
