// Health Green World Colombia — script compartido
document.addEventListener('DOMContentLoaded', function () {

  // ---- Menú flotante (fab) ----
  var fabToggle = document.getElementById('fabToggle');
  var fabStack = document.getElementById('fabStack');
  if (fabToggle && fabStack) {
    fabToggle.addEventListener('click', function () {
      var open = fabStack.classList.toggle('open');
      this.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---- Animaciones al hacer scroll (AOS) ----
  if (window.AOS) {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60
    });
  }

  // ---- Autoplay del video de la compañía al entrar en pantalla ----
  var companyVideo = document.querySelector('.company-video');
  if (companyVideo) {
    // Reforzar mute como propiedad (algunos navegadores solo respetan esto,
    // no solo el atributo HTML) — es indispensable para que el autoplay no
    // sea bloqueado por la política del navegador.
    companyVideo.muted = true;
    companyVideo.defaultMuted = true;
    var tryPlayCompanyVideo = function () { companyVideo.play().catch(function () {}); };
    if ('IntersectionObserver' in window) {
      var cvIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            tryPlayCompanyVideo();
          } else {
            companyVideo.pause();
          }
        });
      }, { threshold: 0.25 });
      cvIO.observe(companyVideo);
      // Respaldo: reintentar en cuanto el video tenga suficientes datos,
      // por si el primer intento de play() fue antes de que cargara.
      companyVideo.addEventListener('loadedmetadata', tryPlayCompanyVideo);
      companyVideo.addEventListener('canplay', tryPlayCompanyVideo);
    } else {
      // Respaldo sin IntersectionObserver: reproducir de una vez.
      tryPlayCompanyVideo();
    }
  }

  // ---- Reveal de fotos de producto + tilt sutil (estilo agencia) ----
  // Nota: las fotos son visibles por defecto (ver site.css); solo se ocultan
  // momentáneamente aquí para animar, y siempre tienen un respaldo por timeout
  // para que nunca queden invisibles si algo falla (caché vieja, error, etc.).
  try {
    var photos = document.querySelectorAll('.product-card .photo');
    if (photos.length && 'IntersectionObserver' in window) {
      photos.forEach(function (p) { p.classList.add('pre-reveal'); });
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('in-view');
            e.target.classList.remove('pre-reveal');
            io.unobserve(e.target);
          }
        });
      }, { threshold: 0.3 });
      photos.forEach(function (p) { io.observe(p); });
      // Respaldo: si por lo que sea el observer no revela algo en 2s, se muestra igual.
      setTimeout(function () {
        photos.forEach(function (p) {
          p.classList.add('in-view');
          p.classList.remove('pre-reveal');
        });
      }, 2000);
    }
  } catch (err) {
    document.querySelectorAll('.product-card .photo').forEach(function (p) {
      p.classList.remove('pre-reveal');
      p.classList.add('in-view');
    });
  }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduceMotion) {
    document.querySelectorAll('.product-card').forEach(function (card) {
      card.addEventListener('mousemove', function (ev) {
        var r = card.getBoundingClientRect();
        var x = (ev.clientX - r.left) / r.width - 0.5;
        var y = (ev.clientY - r.top) / r.height - 0.5;
        card.style.transform = 'rotateX(' + (-y * 6) + 'deg) rotateY(' + (x * 6) + 'deg) translateY(-2px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  // ---- Acordeón de preguntas frecuentes ----
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    if (!q) return;
    q.addEventListener('click', function () {
      var wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (other) {
        if (other !== item) other.classList.remove('open');
      });
      item.classList.toggle('open', !wasOpen);
    });
  });

  // ---- Tutorial colapsable de la calculadora (negocio.html) ----
  var tutorialToggle = document.getElementById('tutorialToggle');
  var tutorialPanel = document.getElementById('tutorialPanel');
  if (tutorialToggle && tutorialPanel) {
    tutorialToggle.addEventListener('click', function () {
      var open = tutorialToggle.classList.toggle('open');
      tutorialPanel.classList.toggle('open', open);
      tutorialToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // ---- Calculadora de ingreso potencial (negocio.html) ----
  var calcBoxes = document.getElementById('calc-boxes');
  var calcTeam = document.getElementById('calc-team');
  if (calcBoxes && calcTeam) {
    var PRECIO_PROMEDIO = 92000;   // precio de referencia promedio de una caja/producto (COP)
    var COMPRA_PROMEDIO_EQUIPO = 145000; // compra promedio inicial de referencia del modelo HGW (COP)
    var MARGEN_VENTA = 0.30;       // venta al público: 30%
    var MARGEN_RECOMPRA = 0.05;    // recompra de equipo: 5%

    function fmt(n) {
      return 'COP ' + Math.round(n).toLocaleString('es-CO');
    }

    function recalc() {
      var boxes = parseInt(calcBoxes.value, 10);
      var team = parseInt(calcTeam.value, 10);

      var ventaDirecta = boxes * PRECIO_PROMEDIO * MARGEN_VENTA;
      var recompra = team * COMPRA_PROMEDIO_EQUIPO * MARGEN_RECOMPRA;
      var total = ventaDirecta + recompra;

      document.getElementById('calc-boxes-val').textContent = boxes;
      document.getElementById('calc-team-val').textContent = team;
      document.getElementById('calc-total').textContent = fmt(total);
      document.getElementById('calc-venta').textContent = fmt(ventaDirecta);
      document.getElementById('calc-recompra').textContent = fmt(recompra);
    }

    calcBoxes.addEventListener('input', recalc);
    calcTeam.addEventListener('input', recalc);
    recalc();
  }

  // ---- Gráficos de mercado (mercado.html) ----
  var dataEl = document.getElementById('market-data');
  if (dataEl && window.Chart) {
    var data = JSON.parse(dataEl.textContent);

    if (window.ChartDataLabels) {
      Chart.register(window.ChartDataLabels);
    }

    var verdeOscuro = '#1b3a2b';
    var verde = '#2f6b47';
    var dorado = '#c9a24b';
    var verdeClaro = '#a9d8ba';
    var naranja = '#ff7a00';

    function fmtCOP(v) {
      return v.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    var evoCtx = document.getElementById('chart-evolucion');
    if (evoCtx) {
      new Chart(evoCtx, {
        type: 'bar',
        data: {
          labels: data.evolucion.labels,
          datasets: [{
            label: 'Mercado (COP billones)',
            data: data.evolucion.valores,
            backgroundColor: data.evolucion.labels.map(function (l, i) {
              return i === data.evolucion.labels.length - 1 ? dorado : verde;
            }),
            borderRadius: 6
          }]
        },
        options: {
          layout: { padding: { top: 26 } },
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: verdeOscuro,
              font: { weight: '700', size: 11.5 },
              formatter: function (v) { return fmtCOP(v); }
            }
          },
          scales: {
            y: { beginAtZero: true, ticks: { callback: function (v) { return v + ' B'; } } }
          }
        }
      });
    }

    var segCtx = document.getElementById('chart-segmentacion');
    if (segCtx) {
      new Chart(segCtx, {
        type: 'doughnut',
        data: {
          labels: data.segmentacion.labels,
          datasets: [{
            data: data.segmentacion.valores,
            backgroundColor: [verdeOscuro, verde, verdeClaro, dorado, naranja]
          }]
        },
        options: {
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10.5 } } },
            datalabels: {
              color: function (ctx) {
                return ctx.dataIndex === 2 ? verdeOscuro : '#fff';
              },
              font: { weight: '700', size: 12.5 },
              formatter: function (v) { return v + '%'; }
            }
          }
        }
      });
    }

    var regCtx = document.getElementById('chart-regional');
    if (regCtx) {
      new Chart(regCtx, {
        type: 'bar',
        data: {
          labels: data.regional.labels,
          datasets: [{
            label: 'Mercado 2025 (COP billones)',
            data: data.regional.valores,
            backgroundColor: data.regional.labels.map(function (l) {
              return l === 'Colombia' ? dorado : verde;
            }),
            borderRadius: 6
          }]
        },
        options: {
          indexAxis: 'y',
          layout: { padding: { right: 38 } },
          plugins: {
            legend: { display: false },
            datalabels: {
              anchor: 'end',
              align: 'right',
              color: verdeOscuro,
              font: { weight: '700', size: 11.5 },
              formatter: function (v) { return fmtCOP(v); }
            }
          },
          scales: {
            x: { beginAtZero: true },
            y: { ticks: { autoSkip: false, font: { size: 10.5 } } }
          }
        }
      });
    }
  }
});
