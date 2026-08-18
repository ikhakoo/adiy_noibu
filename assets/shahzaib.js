(function () {
// For any link that has #chat as its href, make it open the chatbox

document.addEventListener('click', function (e) {
  const btn = e.target.closest('a[href="#chat"]');

  if (!btn) return;

  e.preventDefault();

  if (window.GorgiasChat?.open) {
    window.GorgiasChat.open();
  }
});


//  end



document.addEventListener("click", function (e) {
  const btn = e.target.closest(".book-btn-call");

  if (!btn) return;

  e.preventDefault();
  window.location.href = btn.href;
});


document.addEventListener("DOMContentLoaded", () => {
    const videos = document.querySelectorAll("video");

    const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
        const video = entry.target;

        if (entry.isIntersecting) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
        });
    },
    {
        threshold: 0.5 // 50% video visible ho to play
    }
    );

    videos.forEach((video) => {
    video.muted = true;       // Autoplay ke liye zaroori
    video.playsInline = true;
    observer.observe(video);
    });
});


let players = [];

// Load YouTube API
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

function onYouTubeIframeAPIReady() {
  const iframes = document.querySelectorAll(
    'iframe[src*="youtube.com"], iframe[src*="youtu.be"]'
  );

  iframes.forEach((iframe) => {
    const player = new YT.Player(iframe, {
      events: {
        onReady: function () {
          observePlayer(player, iframe);
        },
      },
    });

    players.push(player);
  });
}

// The YouTube IFrame API invokes this by name on the global scope, so it must
// stay reachable on window even though the rest of the file is IIFE-scoped.
window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

function observePlayer(player, element) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          player.playVideo();
        } else {
          player.pauseVideo();
        }
      });
    },
    {
      threshold: 0.5,
    }
  );

  observer.observe(element);
}


// show start-with-text in cart drawer
document.addEventListener('DOMContentLoaded', () => {
  const cartText = document.querySelector('.cart-navigation-text');
  const target = document.querySelector('.start-img-text');

  if (!cartText || !target) return;

  function toggleClass() {
    const text = cartText.textContent.trim();

    if (!text.includes('(0)')) {
      target.classList.add('show');
    } else {
      target.classList.remove('show');
    }
  }

  // Initial check
  toggleClass();

  // Observe changes because Alpine updates the text dynamically
  const observer = new MutationObserver(toggleClass);
  observer.observe(cartText, {
    childList: true,
    subtree: true,
    characterData: true
  });
});
})();



(function () {
  function checkUrlHashAndOpenChat() {
    if (window.location.hash === '#chat') {
      if (window.GorgiasChat?.open) {
        window.GorgiasChat.open();
      } else {
        // Gorgias widget load hone ka wait karein agar delay ho
        window.addEventListener('gorgias-widget-loaded', function () {
          window.GorgiasChat?.open();
        }, { once: true });
      }
    }
  }

  // Page Load check
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkUrlHashAndOpenChat);
  } else {
    checkUrlHashAndOpenChat();
  }

  // URL Hash Change check
  window.addEventListener('hashchange', checkUrlHashAndOpenChat);
})();