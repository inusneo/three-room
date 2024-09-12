export class TouchController {
  constructor() {
    this.elem = document.querySelector('.controller-mobile');
    this.bar = this.elem.querySelector('.controller-mobile-bar');
    this.setPosition();

    this.elem.addEventListener('touchstart', e => {
      this.walkTouch = e.targetTouches[0];
    });

    this.elem.addEventListener('touchmove', e => {
      this.walkTouch = e.targetTouches[0];
    });

    this.elem.addEventListener('touchend', e => {
      this.walkTouch = null;
    });
  }

  setPosition() {
    this.boundingRect = this.elem.getBoundingClientRect();
    this.width = this.boundingRect.width;
    this.height = this.boundingRect.height;
    this.x = this.boundingRect.x;
    this.y = this.boundingRect.y;
    this.cx = this.x + this.width/2;
    this.cy = this.y + this.height/2;
  }

  setAngleOfBar(radian) {
    this.bar.style.transform = `rotate(${radian * 180 / Math.PI + 90}deg)`;
  }
}