
/* ===== FUNZONE – script.js ===== */

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
const shuf = a => a.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(x => x[1]);

/* SESSION STATE */

const S = {
    played: 0,
    wins: 0,
    score: 0,
    recent: [],
    mute: false,
    cat: 'All',
    q: '',
    t0: Date.now()
};

/* SOUND */

let AC;

function snd(f = 440, d = .1, type = 'sine') {
    if (S.mute) return;

    try {
        AC = AC || new (window.AudioContext || window.webkitAudioContext)();

        const o = AC.createOscillator();
        const g = AC.createGain();

        o.type = type;
        o.frequency.value = f;
        g.gain.value = .05;

        o.connect(g);
        g.connect(AC.destination);

        o.start();
        o.stop(AC.currentTime + d);
    } catch (e) {}
}

/* GAME CATALOGUE */

const GAMES = [
    { id: 'ttt', name: 'Tic Tac Toe', cat: 'Strategy', icon: '❌⭕', hue: 260, two: 1, desc: 'Get three in a row before your rival.', rules: 'Take turns placing X and O. Three in a row wins.' },
    { id: 'rps', name: 'Rock Paper Scissors', cat: 'Arcade', icon: '✊', hue: 20, two: 1, desc: 'The classic hand game. First to 5 wins.', rules: 'Pick rock, paper or scissors. First to 5 wins.' },
    { id: 'snake', name: 'Snake', cat: 'Action', icon: '🐍', hue: 140, pad: 1, desc: 'Eat apples and grow without crashing.', rules: 'Use arrows, WASD, swipe or D-pad.' },
    { id: 'g2048', name: '2048', cat: 'Puzzle', icon: '🔢', hue: 35, pad: 1, desc: 'Slide and merge tiles to reach 2048.', rules: 'Merge equal tiles to reach 2048.' },
    { id: 'memory', name: 'Memory Match', cat: 'Puzzle', icon: '🃏', hue: 330, desc: 'Flip cards and find all the pairs.', rules: 'Find all eight pairs.' },
    { id: 'guess', name: 'Guess the Number', cat: 'Thinking', icon: '🎯', hue: 190, desc: 'Find the secret number in 7 tries.', rules: 'Type a number from 1 to 100. You have seven attempts.' },
    { id: 'hangman', name: 'Hangman', cat: 'Thinking', icon: '🔤', hue: 280, desc: 'Guess the complete word in seven tries.', rules: 'Type the complete five-letter word. Green means correct position, yellow means misplaced and grey means absent.' },
    { id: 'whack', name: 'Whack-a-Mole', cat: 'Action', icon: '🔨', hue: 25, desc: 'Smash the moles – 30 seconds!', rules: 'Tap the moles before time runs out.' },
    { id: 'simon', name: 'Simon Says', cat: 'Arcade', icon: '🎵', hue: 300, desc: 'Watch, remember and repeat the pattern.', rules: 'Repeat the colour sequence.' },
    { id: 'quiz', name: 'Quiz Challenge', cat: 'Thinking', icon: '❓', hue: 210, desc: 'Test your general knowledge.', rules: 'Answer eight multiple-choice questions.' },
    { id: 'scramble', name: 'Word Scramble', cat: 'Puzzle', icon: '🔀', hue: 160, desc: 'Unscramble the letters.', rules: 'Rearrange the letters using the hint.' },
    { id: 'c4', name: 'Connect Four', cat: 'Strategy', icon: '🔴🟡', hue: 230, two: 1, desc: 'Line up four discs to win.', rules: 'Connect four discs horizontally, vertically or diagonally.' },
    { id: 'bubble', name: 'Bubble Shooter', cat: 'Arcade', icon: '🫧', hue: 195, desc: 'Match 3+ bubbles to pop them.', rules: 'Aim and shoot matching bubbles.' },
    { id: 'flappy', name: 'Flappy Bird', cat: 'Action', icon: '🐦', hue: 50, desc: 'Flap through the pipes.', rules: 'Click, tap or press Space to flap.' },
    { id: 'math', name: 'Math Challenge', cat: 'Thinking', icon: '➕', hue: 120, desc: 'Solve sums in 60 seconds.', rules: 'Type your answer or use the keypad. Score 150+ to win.' },
    { id: 'slide', name: 'Sliding Puzzle', cat: 'Puzzle', icon: '🧩', hue: 270, pad: 1, desc: 'Slide tiles into numerical order.', rules: 'Arrange tiles 1–8.' },
    { id: 'sudoku', name: 'Sudoku', cat: 'Puzzle', icon: '9️⃣', hue: 240, desc: 'Fill the grid with 1–9.', rules: 'Fill every row, column and box.' },
    { id: 'fruit', name: 'Fruit Slice', cat: 'Action', icon: '🍉', hue: 355, desc: 'Slice fruit, avoid bombs!', rules: 'Drag across fruit to slice it.' },
    { id: 'tod', name: 'Truth or Dare', cat: 'Arcade', icon: '🎭', hue: 310, two: 1, desc: 'Friendly prompts for everyone.', rules: 'Choose Truth or Dare. Works solo or with two players.' },
    { id: 'dots', name: 'Dots and Boxes', cat: 'Strategy', icon: '🔲', hue: 175, two: 1, desc: 'Close boxes to claim them.', rules: 'Complete boxes to score points.' }
];

const CATS = ['All', 'Puzzle', 'Action', 'Arcade', 'Strategy', 'Thinking'];

/* HOMEPAGE */

const matches = (g, cat) =>
    (cat == 'All' || g.cat == cat) &&
    (g.name + ' ' + g.cat + ' ' + g.desc).toLowerCase().includes(S.q.toLowerCase());

function renderFilters() {
    $('#filters').innerHTML = CATS.map(c =>
        `<button class="${c == S.cat ? 'on' : ''}" data-c="${c}">
            ${c}<em>${GAMES.filter(g => matches(g, c)).length}</em>
        </button>`
    ).join('');
}

function renderGames() {
    const list = GAMES.filter(g => matches(g, S.cat));

    $('#gameGrid').innerHTML = list.map(g => `
        <article class="card" style="--h:${g.hue}">
            <div class="art">
                <span class="em">${g.icon}</span>
                <i></i><i></i>
            </div>
            <div class="info">
                <h3>${g.name}</h3>
                <span class="tag">${g.cat}</span>
                <p>${g.desc}</p>
                <button class="btn glow" data-id="${g.id}">▶ Play</button>
            </div>
        </article>
    `).join('');

    $('#noResults').hidden = list.length > 0;
    $('#resultCount').textContent = `(${list.length} of ${GAMES.length})`;
    $('#clearSearch').hidden = !S.q;

    renderFilters();
}

function upd() {
    $('#stPlayed').textContent = S.played;
    $('#stWins').textContent = S.wins;
    $('#stScore').textContent = S.score;

    $('#recentSection').hidden = !S.recent.length;

    $('#recentList').innerHTML = S.recent.map(id => {
        const g = GAMES.find(x => x.id == id);
        return `<button data-id="${id}">${g.icon} ${g.name}</button>`;
    }).join('');
}

setInterval(() => {
    const s = Math.floor((Date.now() - S.t0) / 1000);
    $('#stTime').textContent =
        Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}, 1000);

$('#searchInput').oninput = e => {
    S.q = e.target.value.trim();
    renderGames();
};

$('#clearSearch').onclick = () => {
    $('#searchInput').value = '';
    S.q = '';
    renderGames();
};

$('#resetBtn').onclick = () => {
    $('#searchInput').value = '';
    S.q = '';
    S.cat = 'All';
    renderGames();
};

$('#filters').onclick = e => {
    const b = e.target.closest('button');
    if (b) {
        S.cat = b.dataset.c;
        renderGames();
    }
};

$('#randomBtn').onclick = () => launch(pick(GAMES).id);

document.addEventListener('click', e => {
    const b = e.target.closest('[data-id]');
    if (b) launch(b.dataset.id);
});

$('#themeBtn').onclick = () => {
    const d = document.documentElement;
    const l = d.dataset.theme == 'dark';

    d.dataset.theme = l ? 'light' : 'dark';
    $('#themeBtn').textContent = l ? '☀️' : '🌙';
};

$$('.sndBtn').forEach(b => {
    b.onclick = () => {
        S.mute = !S.mute;
        $$('.sndBtn').forEach(x => {
            x.textContent = S.mute ? '🔇' : '🔊';
        });
    };
});

/* GAME LAUNCHER */

let cur = null, ctx = null, mode = 1;
const stage = $('#stage');

function stop() {
    if (ctx) {
        ctx.t.forEach(id => {
            clearInterval(id);
            clearTimeout(id);
        });
        ctx.onkey = null;
    }
    ctx = null;
}

function makeCtx() {
    const c = {
        paused: false,
        over: false,
        pts: 0,
        t: [],
        two: mode == 2,
        snd,
        onkey: null,

        msg: t => $('#gameMsg').textContent = t,

        score(n) {
            c.pts += n;
            S.score += n;
            $('#gameScore').textContent = 'Score: ' + c.pts;
            upd();
        },

        every(f, ms) {
            const id = setInterval(() => {
                if (!c.paused) f();
            }, ms);
            c.t.push(id);
            return id;
        },

        after(f, ms) {
            const id = setTimeout(f, ms);
            c.t.push(id);
            return id;
        },

        clear: id => {
            clearInterval(id);
            clearTimeout(id);
        },

        end(m, win) {
            if (c.over) return;
            c.over = true;

            if (win) {
                S.wins++;
                snd(880, .3);
            } else {
                snd(180, .3, 'square');
            }

            $('#resultText').textContent = (win ? '🏆 ' : '') + m;
            $('#result').hidden = false;
            upd();
        }
    };

    return c;
}

function start() {
    stop();

    $('#result').hidden = true;
    $('#gameMsg').textContent = '';
    $('#gameScore').textContent = 'Score: 0';

    $('#pauseBtn').textContent = '⏸ Pause';
    stage.classList.remove('paused');

    const a = document.createElement('div');
    a.className = 'area';

    stage.replaceChildren(a, $('#result'));

    ctx = makeCtx();
    G[cur.id](a, ctx);
}

function launch(id) {
    cur = GAMES.find(g => g.id == id);
    S.played++;

    S.recent = [id, ...S.recent.filter(x => x != id)].slice(0, 6);
    upd();

    $('#modalTitle').textContent = cur.icon + ' ' + cur.name;
    $('#rules').textContent = cur.rules;
    $('#rulesBox').open = true;

    mode = 1;
    $('#modeSel').value = '1';
    $('#modeSel').hidden = !cur.two;
    $('#dpad').hidden = !cur.pad;

    $('#modal').hidden = false;
    document.body.style.overflow = 'hidden';

    start();
}

function closeGame() {
    stop();
    $('#modal').hidden = true;
    document.body.style.overflow = '';
}

$('#closeBtn').onclick = closeGame;

$('#modal').onclick = e => {
    if (e.target.id == 'modal') closeGame();
};

$('#restartBtn').onclick = start;
$('#againBtn').onclick = start;

$('#modeSel').onchange = e => {
    mode = +e.target.value;
    start();
};

$('#pauseBtn').onclick = () => {
    if (!ctx || ctx.over) return;

    ctx.paused = !ctx.paused;
    stage.classList.toggle('paused', ctx.paused);

    $('#pauseBtn').textContent =
        ctx.paused ? '▶ Resume' : '⏸ Pause';
};

/* KEYBOARD AND D-PAD */

const WASD = {
    w: 'ArrowUp',
    a: 'ArrowLeft',
    s: 'ArrowDown',
    d: 'ArrowRight'
};

document.addEventListener('keydown', e => {
    if ($('#modal').hidden) return;
    if (e.key == 'Escape') return closeGame();

    if (!ctx || !ctx.onkey || e.target.tagName == 'INPUT') return;

    if (e.key.startsWith('Arrow') || e.key == ' ') {
        e.preventDefault();
    }

    ctx.onkey({
        key: (cur.pad && WASD[e.key]) || e.key
    });
});

$('#dpad').onclick = e => {
    const k = e.target.dataset.k;
    if (k && ctx && ctx.onkey) {
        ctx.onkey({ key: k });
    }
};

let sx, sy;

stage.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
}, { passive: true });

stage.addEventListener('touchend', e => {
    if (!cur || !cur.pad || !ctx || !ctx.onkey) return;

    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;

    if (Math.max(Math.abs(dx), Math.abs(dy)) < 30) return;

    ctx.onkey({
        key: Math.abs(dx) > Math.abs(dy)
            ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft')
            : (dy > 0 ? 'ArrowDown' : 'ArrowUp')
    });
}, { passive: true });

/* GAME DATA */

const QUIZ = [
    ['Which planet is the Red Planet?', 'Mars', 'Venus', 'Jupiter', 'Saturn'],
    ['How many sides has a hexagon?', '6', '5', '7', '8'],
    ['Capital of Japan?', 'Tokyo', 'Kyoto', 'Osaka', 'Seoul'],
    ['Which gas do plants absorb?', 'Carbon dioxide', 'Oxygen', 'Helium', 'Nitrogen'],
    ['Largest ocean on Earth?', 'Pacific', 'Atlantic', 'Indian', 'Arctic'],
    ['What is 9 × 7?', '63', '54', '56', '72'],
    ['How many continents are there?', '7', '5', '6', '8'],
    ['Chemical formula of water?', 'H2O', 'CO2', 'O2', 'NaCl'],
    ['Who painted the Mona Lisa?', 'Leonardo da Vinci', 'Picasso', 'Van Gogh', 'Monet'],
    ['Which animal is the tallest?', 'Giraffe', 'Elephant', 'Horse', 'Camel']
];

const WORDS = [
    ['PLANET', 'Orbits a star'],
    ['GUITAR', 'Musical instrument with strings'],
    ['JUNGLE', 'Dense tropical forest'],
    ['ROCKET', 'Flies into space'],
    ['PUZZLE', 'A jigsaw is one'],
    ['CASTLE', 'Home of a king'],
    ['DRAGON', 'Mythical fire-breather'],
    ['BANANA', 'Yellow fruit']
];

const HANG = [
    'APPLE', 'BRAIN', 'CLOUD', 'DREAM', 'EARTH',
    'FLAME', 'GRAPE', 'HEART', 'JUICE', 'KNIFE',
    'LEMON', 'MUSIC', 'NIGHT', 'OCEAN', 'PLANT',
    'QUEEN', 'ROBOT', 'SMILE', 'TIGER', 'WATER', 'ZEBRA'
];

const TRUTHS = [
    'What is your favourite food of all time?',
    'What superpower would you choose, and why?',
    'What is the best movie you have ever seen?',
    'If you could visit any country, where would you go?',
    'What is your favourite childhood memory?',
    'What hobby would you love to try?',
    'Which animal would you be for a day?',
    'What is the nicest thing someone has done for you?',
    'What is your favourite song right now?',
    'If you won a prize, what would you wish for?',
    'What is a skill you wish you had?',
    'What is your favourite season and why?',
    'What is one subject you enjoy learning?',
    'What always makes you laugh?',
    'What is your dream holiday destination?',
    'What is one thing you are proud of learning?',
    'Would you rather explore space or the deep ocean?',
    'What is your favourite way to spend a weekend?',
    'Which fictional character would you like to meet?',
    'What is a food you would never get tired of?',
    'What is one small thing that makes your day better?',
    'If you could learn any language, which would it be?',
    'What is your favourite board or video game?',
    'What is the funniest harmless mistake you have made?',
    'Which season matches your personality?',
    'What is a place in your town you enjoy visiting?',
    'What is one invention you wish existed?',
    'Would you rather be great at art or music?',
    'What is something kind you can do for someone today?',
    'What three things would you take on a dream picnic?'
];

const DARES = [
    'Say the alphabet backwards as far as you can.',
    'Make up a short rhyme about your favourite snack.',
    'Do your best robot voice for the next minute.',
    'Draw a cat and show everyone your drawing.',
    'Walk like a penguin for ten steps, if you have space.',
    'Tell a joke that makes someone smile.',
    'Hum a tune and let others guess the song.',
    'Speak in a pirate accent for two turns.',
    'Invent a silly handshake with another player.',
    'Name ten fruits in fifteen seconds.',
    'Make up a new name for your favourite food.',
    'Describe your day using only three words.',
    'Pretend to be a news presenter for thirty seconds.',
    'Say a tongue twister three times.',
    'Draw a house in twenty seconds.',
    'Sing one line of a song you know, or make up a line.',
    'Try to make the group laugh with a funny face.',
    'List five things that are blue.',
    'Tell a two-sentence story about a talking pencil.',
    'Act like a sleepy robot for fifteen seconds.',
    'Spell your first name backwards.',
    'Give everyone in the group a friendly compliment.',
    'Pretend to advertise an ordinary spoon.',
    'Name five animals that live in water.',
    'Make a sound effect for a rainy day.',
    'Describe an imaginary amusement park.',
    'Say a sentence in a dramatic movie-trailer voice.',
    'Create a new emoji and explain what it means.',
    'Do a silent acting impression of a cat.',
    'Share a fun fact you know.'
];

/* THE GAMES */

const G = {};

/* TIC TAC TOE */

G.ttt = (a, c) => {
    const L = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];

    let b = Array(9).fill('');
    let t = 'X';

    const nm = x =>
        x == 'X' ? (c.two ? 'Gamer 1' : 'You')
                 : (c.two ? 'Gamer 2' : 'Computer');

    a.innerHTML = '<div class="b3">' +
        b.map((_, i) => `<button data-i="${i}"></button>`).join('') +
        '</div>';

    const bs = a.querySelectorAll('button');

    const win = () => {
        for (const l of L) {
            if (b[l[0]] && b[l[0]] == b[l[1]] && b[l[0]] == b[l[2]]) {
                return b[l[0]];
            }
        }
    };

    const mv = i => {
        b[i] = t;
        bs[i].textContent = t;
        bs[i].className = t;
        c.snd(t == 'X' ? 500 : 400);

        const w = win();

        if (w) return c.end(nm(w) + ' wins!', w == 'X' || c.two);
        if (!b.includes('')) return c.end("It's a draw!");

        t = t == 'X' ? 'O' : 'X';
        c.msg(nm(t) + "'s turn (" + t + ')');
    };

    const ai = () => {
        const f = p => {
            for (const l of L) {
                const v = l.map(i => b[i]);
                if (v.filter(x => x == p).length == 2 && v.includes('')) {
                    return l[v.indexOf('')];
                }
            }
        };

        let i = f('O');
        if (i == null) i = f('X');
        if (i == null && !b[4]) i = 4;
        if (i == null) {
            i = pick(b.map((x, k) => x ? -1 : k).filter(k => k >= 0));
        }

        mv(i);
    };

    a.onclick = e => {
        const i = e.target.dataset.i;

        if (c.over || i == null || b[i] || (!c.two && t == 'O')) return;

        mv(+i);

        if (!c.over && !c.two) c.after(ai, 400);
    };

    c.msg(nm('X') + "'s turn (X)");
};

/* ROCK PAPER SCISSORS */

G.rps = (a, c) => {
    const M = ['✊', '✋', '✌️'];
    const N = ['Rock', 'Paper', 'Scissors'];

    let s = [0, 0], p1 = null;

    const n1 = c.two ? 'Gamer 1' : 'You';
    const n2 = c.two ? 'Gamer 2' : 'Computer';

    a.innerHTML = '<div class="hm" id="rr">🤜 vs 🤛</div><div class="row">' +
        M.map((m, i) => `<button class="btn big" data-i="${i}">${m}<small>${N[i]}</small></button>`).join('') +
        '</div>';

    a.onclick = e => {
        const bt = e.target.closest('button');
        if (!bt || c.over) return;

        const i = +bt.dataset.i;
        c.snd(500);

        if (c.two && p1 == null) {
            p1 = i;
            return c.msg('Gamer 2: pick your move!');
        }

        const x = c.two ? p1 : i;
        const y = c.two ? i : rnd(3);

        p1 = null;

        const r = (x - y + 3) % 3;

        a.querySelector('#rr').textContent = M[x] + ' vs ' + M[y];

        if (r == 1) s[0]++;
        if (r == 2) s[1]++;

        if (r) c.score(r == 1 ? 10 : 0);

        c.msg(
            (r == 0 ? 'Draw!' : (r == 1 ? n1 : n2) + ' wins the round!') +
            ` ${n1} ${s[0]} – ${s[1]} ${n2}`
        );

        if (s[0] == 5 || s[1] == 5) {
            c.end((s[0] == 5 ? n1 : n2) + ' wins the match!', s[0] == 5 || c.two);
        } else if (c.two) {
            c.after(() => c.msg('Gamer 1: pick your move!'), 1200);
        }
    };

    c.msg(n1 + ': pick your move! (first to 5)');
};



/* SNAKE – SLOWER MOVEMENT */

G.snake = (a, c) => {
    a.innerHTML = '<canvas width="300" height="300"></canvas>';

    const x = a.firstChild.getContext('2d');
    const N = 15, Z = 20;

    let s = [[7,7], [6,7], [5,7]];
    let d = [1,0], nd = d;
    let f = [10,7], id;

    const place = () => {
        do {
            f = [rnd(N), rnd(N)];
        } while (s.some(p => p[0] == f[0] && p[1] == f[1]));
    };

    const draw = () => {
        x.fillStyle = '#120b2e';
        x.fillRect(0, 0, 300, 300);

        x.font = '18px serif';
        x.textBaseline = 'top';
        x.fillText('🍎', f[0] * Z, f[1] * Z);

        s.forEach((p, i) => {
            x.fillStyle = i ? '#22d3ee' : '#a78bfa';
            x.beginPath();
            x.roundRect(p[0] * Z + 1, p[1] * Z + 1, Z - 2, Z - 2, 6);
            x.fill();
        });
    };

    const step = () => {
        d = nd;

        const h = [s[0][0] + d[0], s[0][1] + d[1]];

        if (
            h[0] < 0 || h[1] < 0 ||
            h[0] >= N || h[1] >= N ||
            s.some(p => p[0] == h[0] && p[1] == h[1])
        ) {
            c.clear(id);
            return c.end('Game over! Length ' + s.length, s.length >= 15);
        }

        s.unshift(h);

        if (h[0] == f[0] && h[1] == f[1]) {
            c.score(10);
            c.snd(700);
            place();
        } else {
            s.pop();
        }

        draw();
    };

    c.onkey = e => {
        const m = {
            ArrowUp: [0,-1],
            ArrowDown: [0,1],
            ArrowLeft: [-1,0],
            ArrowRight: [1,0]
        }[e.key];

        if (m && (m[0] + d[0] || m[1] + d[1])) nd = m;
    };

    draw();

    // 350 milliseconds = slower snake
    id = c.every(step, 350);

    c.msg('Arrows / WASD / swipe to steer — slow mode');
};

/* 2048 */

G.g2048 = (a, c) => {
    let b = Array(16).fill(0), gain = 0;

    a.innerHTML = '<div class="b2048"></div>';
    const box = a.firstChild;

    const add = () => {
        const e = b.map((v, i) => v ? -1 : i).filter(i => i >= 0);
        if (e.length) b[pick(e)] = Math.random() < .9 ? 2 : 4;
    };

    const draw = () => {
        box.innerHTML = b.map(v =>
            `<i style="--h:${v ? Math.log2(v) * 32 + 200 : 0}" class="${v ? 't' : ''}">${v || ''}</i>`
        ).join('');
    };

    const line = r => {
        r = r.filter(x => x);

        for (let i = 0; i < r.length - 1; i++) {
            if (r[i] == r[i + 1]) {
                r[i] *= 2;
                gain += r[i];
                r.splice(i + 1, 1);
            }
        }

        while (r.length < 4) r.push(0);
        return r;
    };

    const D = {
        ArrowLeft: i => [0,1,2,3].map(j => i * 4 + j),
        ArrowRight: i => [3,2,1,0].map(j => i * 4 + j),
        ArrowUp: i => [0,1,2,3].map(j => j * 4 + i),
        ArrowDown: i => [3,2,1,0].map(j => j * 4 + i)
    };

    c.onkey = e => {
        const f = D[e.key];
        if (!f || c.over) return;

        gain = 0;
        let ch = 0;

        for (let i = 0; i < 4; i++) {
            const ix = f(i);
            const n = line(ix.map(j => b[j]));

            ix.forEach((j, q) => {
                if (b[j] != n[q]) ch = 1;
                b[j] = n[q];
            });
        }

        if (!ch) return;

        if (gain) {
            c.score(gain);
            c.snd(600);
        }

        add();
        draw();

        if (b.includes(2048)) return c.end('You reached 2048!', true);

        if (
            !b.includes(0) &&
            !b.some((v, i) =>
                (i % 4 < 3 && v == b[i + 1]) ||
                (i < 12 && v == b[i + 4])
            )
        ) {
            c.end('No moves left! Score ' + c.pts, false);
        }
    };

    add();
    add();
    draw();
    c.msg('Merge tiles to reach 2048');
};

/* MEMORY MATCH */

G.memory = (a, c) => {
    const E = shuf(['🍕','🚀','🐱','🎸','🌈','🦄','⚽','🍩']);
    const d = shuf([...E, ...E]);

    let o = [], m = 0, done = 0, lock = 0;

    a.innerHTML = '<div class="mem">' +
        d.map((e, i) => `<button data-i="${i}"><b>${e}</b></button>`).join('') +
        '</div>';

    a.onclick = ev => {
        const bt = ev.target.closest('button');

        if (!bt || lock || bt.classList.contains('on')) return;

        bt.classList.add('on');
        c.snd(400);
        o.push(bt);

        if (o.length == 2) {
            m++;
            c.msg('Moves: ' + m);

            const [x, y] = o;

            if (d[x.dataset.i] == d[y.dataset.i]) {
                o = [];
                done++;

                x.classList.add('ok');
                y.classList.add('ok');

                c.score(10);
                c.snd(800);

                if (done == 8) c.end('All pairs found in ' + m + ' moves!', true);
            } else {
                lock = 1;

                c.after(() => {
                    x.classList.remove('on');
                    y.classList.remove('on');
                    o = [];
                    lock = 0;
                }, 800);
            }
        }
    };

    c.msg('Moves: 0');
};

/* GUESS THE NUMBER – MANUAL TYPING, 7 ATTEMPTS */

G.guess = (a, c) => {
    const secret = 1 + rnd(100);
    let left = 7;

    a.innerHTML = `
        <p>I'm thinking of a number from 1 to 100.</p>
        <div class="row">
            <input class="guess-input" type="text"
                inputmode="numeric" pattern="[0-9]*"
                maxlength="3" placeholder="Type 1–100"
                autocomplete="off" aria-label="Your guess">

            <button class="btn glow guess-submit" type="button">
                Guess
            </button>
        </div>

        <p class="guess-history">
            Attempts left: <strong class="tries">7</strong>
        </p>
    `;

    const input = a.querySelector('.guess-input');
    const tries = a.querySelector('.tries');

    input.addEventListener('input', () => {
        input.value = input.value.replace(/\D/g, '').slice(0, 3);
    });

    const submit = () => {
        if (c.over || c.paused) return;

        const value = Number(input.value);

        if (!input.value || !Number.isInteger(value) || value < 1 || value > 100) {
            c.msg('Please type a number from 1 to 100.');
            input.focus();
            return;
        }

        left--;
        tries.textContent = left;
        input.value = '';

        c.snd(450);

        if (value === secret) {
            c.score(left * 10 + 10);
            return c.end('Correct! The secret number was ' + secret + '.', true);
        }

        if (left === 0) {
            return c.end('No attempts left! The number was ' + secret + '.', false);
        }

        c.msg(
            (value < secret ? '⬆️ Try a HIGHER number!' : '⬇️ Try a LOWER number!') +
            ` ${left} tries left.`
        );

        input.focus();
    };

    a.querySelector('.guess-submit').addEventListener('click', submit);

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') submit();
    });

    c.msg('You have 7 attempts. Type your first guess!');
    input.focus();
};

/* HANGMAN – FULL WORD GUESSING, 7 ROWS AND COLOURS */

G.hangman = (a, c) => {
    const answer = pick(HANG);
    const WORD_LENGTH = answer.length;
    const MAX_TRIES = 7;

    let tries = 0;
    let finished = false;

    a.innerHTML = `
        <p>Guess the complete ${WORD_LENGTH}-letter word.</p>

        <div class="wordle-board" aria-label="Seven guess rows">
            ${Array.from({ length: MAX_TRIES }, (_, row) => `
                <div class="word-row" data-row="${row}">
                    ${Array.from(
                        { length: WORD_LENGTH },
                        () => '<div class="word-cell"></div>'
                    ).join('')}
                </div>
            `).join('')}
        </div>

        <div class="row">
            <input class="word-input" type="text"
                maxlength="${WORD_LENGTH}"
                placeholder="Type the word"
                autocomplete="off"
                autocapitalize="characters"
                spellcheck="false"
                aria-label="Type your word">

            <button class="btn glow word-submit" type="button">
                Submit
            </button>
        </div>

        <p class="guess-history">
            Attempts left: <strong class="word-tries">7</strong>
        </p>

        <p class="word-hint">
            🟩 Correct place &nbsp;
            🟨 Wrong place &nbsp;
            ⬛ Not in word
        </p>
    `;

    const input = a.querySelector('.word-input');
    const triesLabel = a.querySelector('.word-tries');
    const rows = [...a.querySelectorAll('.word-row')];

    input.addEventListener('input', () => {
        input.value = input.value
            .toUpperCase()
            .replace(/[^A-Z]/g, '')
            .slice(0, WORD_LENGTH);
    });

    const colourGuess = (guess, row) => {
        const result = Array(WORD_LENGTH).fill('absent');
        const remaining = answer.split('');

        // Exact-position matches first.
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (guess[i] === answer[i]) {
                result[i] = 'correct';
                remaining[i] = null;
            }
        }

        // Misplaced letters next.
        for (let i = 0; i < WORD_LENGTH; i++) {
            if (result[i] === 'correct') continue;

            const found = remaining.indexOf(guess[i]);

            if (found !== -1) {
                result[i] = 'misplaced';
                remaining[found] = null;
            }
        }

        [...row.children].forEach((cell, i) => {
            cell.textContent = guess[i] || '';
            cell.classList.add(result[i]);
        });
    };

    const submit = () => {
        if (c.over || c.paused || finished) return;

        const guess = input.value.trim().toUpperCase();

        if (guess.length !== WORD_LENGTH) {
            c.msg(`Please enter a ${WORD_LENGTH}-letter word.`);
            input.focus();
            return;
        }

        const row = rows[tries];

        colourGuess(guess, row);

        tries++;
        triesLabel.textContent = MAX_TRIES - tries;

        input.value = '';
        c.snd(500);

        if (guess === answer) {
            finished = true;

            c.score((MAX_TRIES - tries + 1) * 10);

            return c.end(
                `Excellent! You guessed ${answer} in ${tries} ${tries === 1 ? 'try' : 'tries'}!`,
                true
            );
        }

        if (tries >= MAX_TRIES) {
            finished = true;
            return c.end(`Game over! The word was ${answer}.`, false);
        }

        c.msg(`Not quite! ${MAX_TRIES - tries} attempts remaining.`);
        input.focus();
    };

    a.querySelector('.word-submit').addEventListener('click', submit);

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') submit();
    });

    c.msg(`Type the complete ${WORD_LENGTH}-letter word. You have 7 tries!`);
    input.focus();
};

/* WHACK-A-MOLE */

G.whack = (a, c) => {
    let tm = 30, up = -1;

    a.innerHTML = '<div class="moles">' + '<button></button>'.repeat(9) + '</div>';

    const h = [...a.querySelectorAll('button')];

    const hide = () => {
        if (up >= 0) {
            h[up].textContent = '';
            h[up].classList.remove('up');
        }
    };

    a.onclick = e => {
        const i = h.indexOf(e.target);

        if (i < 0 || c.over) return;

        if (i == up) {
            hide();
            up = -1;
            c.score(10);
            c.snd(700);
        }
    };

    c.every(() => {
        if (c.over) return;

        hide();
        up = rnd(9);
        h[up].textContent = '🐹';
        h[up].classList.add('up');
    }, 750);

    const ti = c.every(() => {
        tm--;
        c.msg('⏱ ' + tm + 's');

        if (!tm) {
            c.clear(ti);
            hide();
            c.end('Time up! Score ' + c.pts, c.pts >= 100);
        }
    }, 1000);

    c.msg('⏱ 30s');
};

/* SIMON SAYS */

G.simon = (a, c) => {
    const col = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];
    const fr = [262, 330, 392, 523];

    let seq = [], p = 0, busy = 1;

    a.innerHTML = '<div class="simon">' +
        col.map((k, i) =>
            `<button data-i="${i}" style="--c:${k}"></button>`
        ).join('') +
        '</div>';

    const bs = [...a.querySelectorAll('button')];

    const fl = i => {
        bs[i].classList.add('lit');
        c.snd(fr[i], .3);

        c.after(() => bs[i].classList.remove('lit'), 300);
    };

    const round = () => {
        seq.push(rnd(4));
        p = 0;
        busy = 1;

        c.msg('Round ' + seq.length + ' – watch…');

        seq.forEach((s, k) => c.after(() => fl(s), 600 + k * 600));

        c.after(() => {
            busy = 0;
            c.msg('Your turn!');
        }, 600 + seq.length * 600);
    };

    a.onclick = e => {
        const i = e.target.dataset.i;

        if (i == null || busy || c.over) return;

        fl(+i);

        if (+i != seq[p]) {
            return c.end('Wrong! You reached round ' + seq.length, seq.length > 5);
        }

        if (++p == seq.length) {
            c.score(10);
            busy = 1;

            if (seq.length == 6) {
                return c.end('Round 6 reached – amazing memory!', true);
            }

            c.after(round, 800);
        }
    };

    c.after(round, 500);
};

/* QUIZ CHALLENGE */

G.quiz = (a, c) => {
    const qs = shuf(QUIZ).slice(0, 8);
    let i = 0, ok = 0, lock = 0;

    const show = () => {
        const q = qs[i];

        c.msg(`Question ${i + 1} / 8`);

        a.innerHTML = `<h3>${q[0]}</h3><div class="opts">` +
            shuf(q.slice(1)).map(x =>
                `<button class="btn">${x}</button>`
            ).join('') +
            '</div>';
    };

    a.onclick = e => {
        if (e.target.tagName != 'BUTTON' || lock || c.over) return;

        const good = e.target.textContent == qs[i][1];

        e.target.classList.add(good ? 'good' : 'bad');
        lock = 1;

        if (good) {
            ok++;
            c.score(10);
            c.snd(700);
        } else {
            c.snd(200, .2, 'square');
        }

        c.after(() => {
            lock = 0;

            if (++i < 8) show();
            else c.end(`You scored ${ok} / 8`, ok >= 5);
        }, 900);
    };

    show();
};

/* WORD SCRAMBLE */


G.scramble = (a, c) => {
    const ws = shuf(WORDS).slice(0, 5);
    let i = 0;

    a.innerHTML = `
        <div class="hm"></div>
        <p></p>

        <div class="row scramble-row">
            <input
                type="text"
                id="scrambleAnswer"
                placeholder="Type your answer here..."
                autocomplete="off"
                autocapitalize="characters"
                spellcheck="false"
            >

            <button class="btn glow" id="ck" type="button">
                Check
            </button>

            <button class="btn ghost" id="sk" type="button">
                Skip
            </button>
        </div>
    `;

    const inp = a.querySelector('#scrambleAnswer');
    const checkBtn = a.querySelector('#ck');
    const skipBtn = a.querySelector('#sk');

    const nx = () => {
        if (i >= ws.length) {
            inp.disabled = true;
            checkBtn.disabled = true;
            skipBtn.disabled = true;

            return c.end(
                'Finished! Score ' + c.pts,
                c.pts >= 30
            );
        }

        const w = ws[i][0];
        let scrambled;

        do {
            scrambled = shuf([...w]).join('');
        } while (scrambled.toUpperCase() === w.toUpperCase());

        a.querySelector('.hm').textContent = scrambled;

        a.querySelector('p').textContent =
            `Hint: ${ws[i][1]} (${i + 1}/${ws.length})`;

        inp.value = '';
        inp.disabled = false;
        inp.focus();
    };

    const ck = () => {
        if (c.over || i >= ws.length) return;

        const answer = inp.value.trim().toUpperCase();
        const correctAnswer = ws[i][0].toUpperCase();

        if (!answer) {
            c.msg('Please type your answer first!');
            inp.focus();
            return;
        }

        if (answer === correctAnswer) {
            c.score(10);
            c.snd(700);
            c.msg('Correct! 🎉');

            i++;
            nx();
        } else {
            c.msg('Not quite! Try again.');
            c.snd(200, .1, 'square');
            inp.select();
            inp.focus();
        }
    };

    checkBtn.addEventListener('click', ck);

    inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
            e.preventDefault();
            ck();
        }
    });

    skipBtn.addEventListener('click', () => {
        if (c.over || i >= ws.length) return;

        i++;
        nx();
    });

    nx();
};


/* CONNECT FOUR */

G.c4 = (a, c) => {
    const R = 6, C = 7;

    let b = Array.from({ length: C }, () => []);
    let t = 1;

    const nm = p =>
        p == 1
            ? (c.two ? 'Gamer 1 🔴' : 'You 🔴')
            : (c.two ? 'Gamer 2 🟡' : 'Computer 🟡');

    a.innerHTML = '<div class="c4">' +
        b.map((_, x) =>
            `<button data-c="${x}">${'<i></i>'.repeat(R)}</button>`
        ).join('') +
        '</div>';

    const cols = [...a.querySelectorAll('button')];

    const g = (x, y) =>
        x >= 0 && x < C && y >= 0 && y < R
            ? b[x][y] || 0
            : 0;

    const win = (x, y, p) =>
        [[1,0], [0,1], [1,1], [1,-1]].some(([dx, dy]) => {
            let n = 1;

            for (const s of [1, -1]) {
                for (
                    let k = 1;
                    k < 4 && g(x + s * k * dx, y + s * k * dy) == p;
                    k++
                ) n++;
            }

            return n >= 4;
        });

    const play = x => {
        const y = b[x].length;

        b[x].push(t);
        cols[x].children[R - 1 - y].className = 'p' + t;

        c.snd(300 + x * 40);

        if (win(x, y, t)) {
            return c.end(nm(t) + ' wins!', t == 1 || c.two);
        }

        if (b.every(q => q.length == R)) {
            return c.end("It's a draw!");
        }

        t = 3 - t;
        c.msg(nm(t) + "'s turn");

        if (!c.two && t == 2) c.after(ai, 500);
    };

    const ai = () => {
        const v = [...Array(C).keys()].filter(x => b[x].length < R);

        const f = p => v.find(x => {
            b[x].push(p);
            const w = win(x, b[x].length - 1, p);
            b[x].pop();
            return w;
        });

        let x = f(2);

        if (x == null) x = f(1);

        if (x == null) {
            x = shuf(v).sort((p, q) =>
                Math.abs(p - 3) - Math.abs(q - 3)
            )[0];
        }

        play(x);
    };

    a.onclick = e => {
        const bt = e.target.closest('button');

        if (!bt || c.over || (!c.two && t == 2)) return;

        const x = +bt.dataset.c;

        if (b[x].length < R) play(x);
    };

    c.msg(nm(1) + "'s turn");
};


/* BUBBLE SHOOTER */

G.bubble = (a, c) => {
    a.innerHTML = '<canvas width="300" height="400"></canvas>';

    const cv = a.firstChild;
    const x = cv.getContext('2d');

    const K = ['#ef4444', '#22c55e', '#3b82f6', '#eab308', '#a855f7'];
    const C = 10, RW = 13;

    let g = [];
    let cu = pick(K);
    let sh = null;
    let ang = -Math.PI / 2;
    let shots = 0;

    for (let r = 0; r < RW; r++) {
        g.push(Array(C).fill(null));
    }

    for (let r = 0; r < 5; r++) {
        for (let q = 0; q < C; q++) {
            g[r][q] = pick(K);
        }
    }

    const dot = (px, py, k) => {
        x.fillStyle = k;
        x.beginPath();
        x.arc(px, py, 14, 0, 7);
        x.fill();

        x.fillStyle = '#fff5';
        x.beginPath();
        x.arc(px - 5, py - 5, 4, 0, 7);
        x.fill();
    };

    const draw = () => {
        x.fillStyle = '#120b2e';
        x.fillRect(0, 0, 300, 400);

        g.forEach((row, r) =>
            row.forEach((k, q) => {
                if (k) dot(q * 30 + 15, r * 30 + 15, k);
            })
        );

        x.strokeStyle = '#fff7';
        x.beginPath();
        x.moveTo(150, 380);
        x.lineTo(150 + Math.cos(ang) * 70, 380 + Math.sin(ang) * 70);
        x.stroke();

        dot(150, 380, cu);

        if (sh) dot(sh.x, sh.y, sh.k);
    };

    const lost = () => g.slice(11).some(row => row.some(k => k));

    const land = () => {
        let best, bd = 1e9;

        g.forEach((row, r) => row.forEach((k, q) => {
            if (!k) {
                const d = Math.hypot(
                    q * 30 + 15 - sh.x,
                    r * 30 + 15 - sh.y
                );

                if (d < bd) {
                    bd = d;
                    best = [r, q];
                }
            }
        }));

        const [r, q] = best;
        g[r][q] = sh.k;

        const st = [[r, q]];
        const seen = new Set([r + ',' + q]);

        for (let i = 0; i < st.length; i++) {
            const [y, z] = st[i];

            [[1,0], [-1,0], [0,1], [0,-1]].forEach(([dy, dz]) => {
                const Y = y + dy;
                const Z = z + dz;

                if (
                    g[Y] &&
                    g[Y][Z] == sh.k &&
                    !seen.has(Y + ',' + Z)
                ) {
                    seen.add(Y + ',' + Z);
                    st.push([Y, Z]);
                }
            });
        }

        if (st.length >= 3) {
            st.forEach(([y, z]) => g[y][z] = null);
            c.score(st.length * 10);
            c.snd(800);
        }

        sh = null;
        shots++;

        if (!g.flat().some(Boolean)) {
            return c.end('You cleared the board!', true);
        }

        if (lost()) {
            return c.end('The bubbles reached the bottom!', false);
        }

        if (shots % 5 == 0) {
            g.pop();
            g.unshift(Array.from({ length: C }, () => pick(K)));

            if (lost()) {
                return c.end('The bubbles reached the bottom!', false);
            }
        }

        cu = pick(g.flat().filter(Boolean));
    };

    const fire = () => {
        if (sh || c.over || c.paused) return;

        sh = {
            x: 150,
            y: 380,
            dx: Math.cos(ang) * 9,
            dy: Math.sin(ang) * 9,
            k: cu
        };

        c.snd(500, .05);
    };

    const aim = e => {
        const b = cv.getBoundingClientRect();

        ang = Math.min(
            -.2,
            Math.max(
                -Math.PI + .2,
                Math.atan2(
                    (e.clientY - b.top) * 400 / b.height - 380,
                    (e.clientX - b.left) * 300 / b.width - 150
                )
            )
        );
    };

    cv.onpointermove = aim;

    cv.onpointerdown = e => {
        aim(e);
        fire();
    };

    c.onkey = e => {
        if (e.key == 'ArrowLeft') {
            ang = Math.max(-Math.PI + .2, ang - .1);
        }

        if (e.key == 'ArrowRight') {
            ang = Math.min(-.2, ang + .1);
        }

        if (e.key == ' ' || e.key == 'ArrowUp') fire();
    };

    c.every(() => {
        if (c.over) return;

        if (sh) {
            sh.x += sh.dx;
            sh.y += sh.dy;

            if (sh.x < 14 || sh.x > 286) sh.dx *= -1;

            let hit = sh.y <= 15;

            g.forEach((row, r) =>
                row.forEach((k, q) => {
                    if (
                        k &&
                        Math.hypot(
                            q * 30 + 15 - sh.x,
                            r * 30 + 15 - sh.y
                        ) < 26
                    ) hit = true;
                })
            );

            if (hit) land();
        }

        draw();
    }, 16);

    draw();
    c.msg('Aim and shoot!');
};

/* FLAPPY BIRD */

G.flappy = (a, c) => {
    a.innerHTML = '<canvas width="300" height="420"></canvas>';

    const cv = a.firstChild;
    const x = cv.getContext('2d');

    let y = 200, v = 0, ps = [], f = 0, s = 0, run = 0;

    const flap = () => {
        if (c.over || c.paused) return;

        run = 1;
        v = -6.2;
        c.snd(600, .05);
    };

    const die = () => c.end('Crashed! Score ' + s, s >= 10);

    cv.onpointerdown = flap;

    c.onkey = e => {
        if (e.key == ' ' || e.key == 'ArrowUp') flap();
    };

    c.every(() => {
        if (c.over) return;

        x.fillStyle = '#1e1b4b';
        x.fillRect(0, 0, 300, 420);

        if (run) {
            v += .4;
            y += v;
            f++;

            if (f % 90 == 1) {
                ps.push({ x: 300, g: 100 + rnd(180), p: 0 });
            }

            ps.forEach(p => p.x -= 2.5);
            ps = ps.filter(p => p.x > -50);
        }

        ps.forEach(p => {
            x.fillStyle = '#22c55e';

            x.fillRect(p.x, 0, 44, p.g - 60);
            x.fillRect(p.x, p.g + 60, 44, 420);

            if (!p.p && p.x + 44 < 68) {
                p.p = 1;
                s++;
                c.score(1);
                c.snd(900, .05);
                c.msg('Score: ' + s);
            }

            if (
                92 > p.x &&
                68 < p.x + 44 &&
                (y - 12 < p.g - 60 || y + 12 > p.g + 60)
            ) die();
        });

        if (y > 408 || y < 12) die();

        x.font = '26px serif';
        x.textAlign = 'center';
        x.fillText('🐦', 80, y + 9);
    }, 16);

    c.msg('Tap / click / Space to flap');
};

/* MATH CHALLENGE – MANUAL TYPING + WORKING KEYPAD */

G.math = (a, c) => {
    let timeLeft = 60;
    let answerValue = 0;
    let streak = 0;

    a.innerHTML = `
        <div class="hm math-question"></div>

        <p class="math-streak">
            🔥 Streak: <strong>0</strong>
        </p>

        <div class="row">
            <input class="math-answer" type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="Type answer"
                aria-label="Math answer">

            <button class="btn glow math-submit" type="button">
                Answer
            </button>
        </div>

        <div class="math-keypad">
            ${['7','8','9','4','5','6','1','2','3','⌫','0','Clear'].map(key =>
                `<button class="btn ghost math-key"
                    type="button" data-key="${key}">${key}</button>`
            ).join('')}
        </div>

        <p class="math-timer">⏱ 60 seconds</p>
    `;

    const input = a.querySelector('.math-answer');
    const question = a.querySelector('.math-question');
    const streakLabel = a.querySelector('.math-streak strong');
    const timerLabel = a.querySelector('.math-timer');

    const nextQuestion = () => {
        const operator = pick(['+', '-', '×']);

        let first, second;

        if (operator === '×') {
            first = 1 + rnd(12);
            second = 1 + rnd(12);
            answerValue = first * second;
        } else if (operator === '-') {
            first = 10 + rnd(41);
            second = rnd(first + 1);
            answerValue = first - second;
        } else {
            first = 1 + rnd(50);
            second = 1 + rnd(50);
            answerValue = first + second;
        }

        question.textContent = `${first} ${operator} ${second} = ?`;

        input.value = '';
        input.focus();
    };

    input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
    });

    const submitAnswer = () => {
        if (c.over || c.paused || input.value.trim() === '') return;

        if (Number(input.value) === answerValue) {
            streak++;
            c.score(10 + streak);
            c.snd(760, .12);
            c.msg('✅ Correct! Keep going.');
        } else {
            streak = 0;
            c.snd(190, .15, 'square');
            c.msg('❌ Not quite! Try the next question.');
        }

        streakLabel.textContent = streak;
        nextQuestion();
    };

    a.querySelector('.math-submit').addEventListener('click', submitAnswer);

    input.addEventListener('keydown', e => {
        if (e.key === 'Enter') submitAnswer();
    });

    // On-screen keypad.
    a.querySelector('.math-keypad').addEventListener('click', e => {
        const button = e.target.closest('[data-key]');

        if (!button || c.over || c.paused) return;

        const key = button.dataset.key;

        if (key === 'Clear') {
            input.value = '';
        } else if (key === '⌫') {
            input.value = input.value.slice(0, -1);
        } else {
            input.value += key;
        }

        input.focus();
    });

    // 60-second timer.
    const timer = c.every(() => {
        timeLeft--;

        timerLabel.textContent = `⏱ ${timeLeft} seconds`;

        if (timeLeft <= 0) {
            c.clear(timer);
            c.end('Time is up! Your score: ' + c.pts, c.pts >= 150);
        }
    }, 1000);

    nextQuestion();
    c.msg('Solve as many questions as you can in 60 seconds!');
};

/* SLIDING PUZZLE */

G.slide = (a, c) => {
    let b = [1,2,3,4,5,6,7,8,0];
    let m = 0, z0 = 8;

    const nb = z =>
        [[z - 3, z > 2], [z + 3, z < 6],
         [z - 1, z % 3 > 0], [z + 1, z % 3 < 2]]
        .filter(p => p[1]).map(p => p[0]);

    for (let k = 0; k < 150; k++) {
        const n = pick(nb(z0));
        [b[z0], b[n]] = [b[n], b[z0]];
        z0 = n;
    }

    a.innerHTML = '<div class="slide"></div>';

    const box = a.firstChild;

    const draw = () => {
        box.innerHTML = b.map((v, i) =>
            `<button data-i="${i}" class="${v ? '' : 'blank'}">${v || ''}</button>`
        ).join('');
    };

    const tap = i => {
        if (c.over) return;

        const z = b.indexOf(0);

        if (!nb(z).includes(i)) return;

        [b[z], b[i]] = [b[i], b[z]];

        m++;
        c.snd(400);
        c.msg('Moves: ' + m);

        draw();

        if (b.every((v, k) => v == (k + 1) % 9)) {
            c.score(Math.max(10, 100 - m));
            c.end('Solved in ' + m + ' moves!', true);
        }
    };

    box.onclick = e => {
        const i = e.target.dataset.i;
        if (i != null) tap(+i);
    };

    c.onkey = e => {
        const z = b.indexOf(0);

        const t = {
            ArrowUp: z + 3,
            ArrowDown: z - 3,
            ArrowLeft: z + 1,
            ArrowRight: z - 1
        }[e.key];

        if (t != null && t >= 0 && t < 9) tap(t);
    };

    draw();
    c.msg('Moves: 0');
};

/* SUDOKU */

G.sudoku = (a, c) => {
    const dg = shuf([1,2,3,4,5,6,7,8,9]);
    const sol = [];

    for (let r = 0; r < 9; r++) {
        for (let q = 0; q < 9; q++) {
            sol.push(dg[(r * 3 + Math.floor(r / 3) + q) % 9]);
        }
    }

    const keep = new Set(shuf([...Array(81).keys()]).slice(0, 38));

    let h = '';

    for (let i = 0; i < 81; i++) {
        const r = Math.floor(i / 9);
        const q = i % 9;

        h += `<input maxlength="1" inputmode="numeric"
            class="${q % 3 == 2 && q < 8 ? 'r' : ''} ${r % 3 == 2 && r < 8 ? 'b' : ''}"
            ${keep.has(i) ? 'readonly value="' + sol[i] + '"' : ''}>`;
    }

    a.innerHTML = `
        <div class="sudoku">${h}</div>
        <button class="btn glow">✔ Check</button>
    `;

    const inp = [...a.querySelectorAll('input')];

    a.oninput = e => {
        const t = e.target;

        t.value = t.value.replace(/[^1-9]/g, '');
        t.classList.remove('bad');

        c.snd(450, .05);

        if (inp.every((n, i) => n.value == sol[i])) {
            c.score(100);
            c.end('Sudoku solved! 🧩', true);
        }
    };

    a.querySelector('button').onclick = () => {
        let bad = 0;

        inp.forEach((n, i) => {
            const w = n.value && n.value != sol[i];

            n.classList.toggle('bad', !!w);

            if (w) bad++;
        });

        c.msg(bad ? bad + ' wrong cell(s)' : 'No mistakes so far!');
    };

    c.msg('Fill every row, column and box with 1–9');
};

/* FRUIT SLICE */

G.fruit = (a, c) => {
    a.innerHTML = '<canvas width="320" height="420"></canvas>';

    const cv = a.firstChild;
    const x = cv.getContext('2d');

    const E = ['🍉', '🍎', '🍊', '🍋', '🍇', '🍓'];

    let fs = [], lives = 3, tr = [], down = 0, f = 0;

    const pos = ev => {
        const b = cv.getBoundingClientRect();

        return [
            (ev.clientX - b.left) * 320 / b.width,
            (ev.clientY - b.top) * 420 / b.height
        ];
    };

    cv.onpointerdown = e => {
        down = 1;
        cv.setPointerCapture(e.pointerId);
    };

    cv.onpointerup = () => {
        down = 0;
        tr = [];
    };

    cv.onpointermove = e => {
        if (!down || c.paused || c.over) return;

        const [px, py] = pos(e);

        tr.push([px, py]);

        if (tr.length > 8) tr.shift();

        fs.forEach(o => {
            if (!o.cut && Math.hypot(o.x - px, o.y - py) < 30) {
                o.cut = 1;

                if (o.e == '💣') {
                    c.end('Boom! 💥 Score ' + c.pts, c.pts >= 100);
                } else {
                    c.score(10);
                    c.snd(800, .08);
                }
            }
        });
    };

    c.every(() => {
        if (c.over) return;

        f++;

        if (f % 38 == 0) {
            fs.push({
                x: 30 + rnd(260),
                y: 440,
                vx: Math.random() * 5 - 2.5,
                vy: -(11 + rnd(4)),
                e: Math.random() < .18 ? '💣' : pick(E),
                cut: 0
            });
        }

        x.fillStyle = '#1e1b4b';
        x.fillRect(0, 0, 320, 420);

        fs.forEach(o => {
            o.x += o.vx;
            o.y += o.vy;
            o.vy += .25;
        });

        fs = fs.filter(o => {
            if (o.y > 440 && o.vy > 0) {
                if (!o.cut && o.e != '💣') {
                    lives--;
                    c.snd(200, .15, 'square');
                }

                return false;
            }

            return true;
        });

        if (lives <= 0) {
            return c.end('Too many misses! Score ' + c.pts, c.pts >= 100);
        }

        x.font = '40px serif';
        x.textAlign = 'center';

        fs.forEach(o => {
            x.globalAlpha = o.cut ? .35 : 1;
            x.fillText(o.cut && o.e != '💣' ? '✂️' : o.e, o.x, o.y);
        });

        x.globalAlpha = 1;

        x.strokeStyle = '#fff';
        x.lineWidth = 3;
        x.beginPath();

        tr.forEach((p, i) =>
            i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])
        );

        x.stroke();

        c.msg('Lives: ' + '❤️'.repeat(lives));
    }, 16);
};

/* TRUTH OR DARE – 30 TRUTHS AND 30 DARES */

G.tod = (a, c) => {
    let p = 0;

    const P = c.two
        ? ['Gamer 1', 'Gamer 2']
        : ['You'];

    a.innerHTML = `
        <h3></h3>

        <div class="row">
            <button class="btn glow" data-k="T">🤔 Truth</button>
            <button class="btn pink" data-k="D">🔥 Dare</button>
        </div>

        <div class="card2">Pick Truth or Dare!</div>

        <button class="btn ghost" id="dn" hidden>
            Done ✓
        </button>
    `;

    const h = a.querySelector('h3');
    const cd = a.querySelector('.card2');
    const dn = a.querySelector('#dn');
    const rw = a.querySelector('.row');

    const turn = () => {
        h.textContent = P[p] + (P.length > 1 ? "'s turn" : ': your turn');
    };

    a.onclick = e => {
        const k = e.target.dataset.k;

        if (k) {
            cd.textContent =
                (k == 'T' ? '🤔 Truth: ' : '🔥 Dare: ') +
                pick(k == 'T' ? TRUTHS : DARES);

            rw.hidden = true;
            dn.hidden = false;

            c.snd(600);
        } else if (e.target.id == 'dn') {
            c.score(5);
            c.snd(750);

            p = (p + 1) % P.length;

            cd.textContent = 'Pick Truth or Dare!';
            rw.hidden = false;
            dn.hidden = true;

            turn();
        }
    };

    turn();
    c.msg('Choose Truth or Dare');
};

/* DOTS AND BOXES */

G.dots = (a, c) => {
    const N = 4, W = 2 * N + 1;

    let e = {}, bx = {}, t = 1, sc = [0, 0];

    const nm = p =>
        p == 1
            ? (c.two ? 'Gamer 1' : 'You')
            : (c.two ? 'Gamer 2' : 'Computer');

    let h = '';

    for (let r = 0; r < W; r++) {
        for (let q = 0; q < W; q++) {
            const k = r + ',' + q;

            h += r % 2 == 0 && q % 2 == 0
                ? '<i class="dot"></i>'
                : r % 2 == q % 2
                    ? `<b class="box" data-b="${k}"></b>`
                    : `<button class="edge" data-k="${k}"></button>`;
        }
    }

    a.innerHTML = `
        <div class="dab" style="grid-template-columns:repeat(${N},12px 52px) 12px">
            ${h}
        </div>
    `;

    const adj = k => {
        const [r, q] = k.split(',').map(Number);

        return (
            r % 2 == 0
                ? [[r - 1, q], [r + 1, q]]
                : [[r, q - 1], [r, q + 1]]
        ).filter(([y, z]) =>
            y > 0 && z > 0 && y < W - 1 && z < W - 1
        );
    };

    const sides = (y, z) =>
        [[y - 1, z], [y + 1, z], [y, z - 1], [y, z + 1]]
            .filter(([i, j]) => e[i + ',' + j]).length;

    const info = () =>
        c.msg(`${nm(1)} ${sc[0]} – ${sc[1]} ${nm(2)} | ${nm(t)}'s turn`);

    const play = k => {
        e[k] = t;

        a.querySelector(`[data-k="${k}"]`).classList.add('p' + t);

        c.snd(450);

        let got = 0;

        adj(k).forEach(([y, z]) => {
            const id = y + ',' + z;

            if (sides(y, z) == 4 && !bx[id]) {
                bx[id] = t;
                sc[t - 1]++;
                got++;

                const b = a.querySelector(`[data-b="${id}"]`);

                b.classList.add('p' + t);
                b.textContent = t == 1 ? '●' : '◆';

                c.snd(800);
            }
        });

        if (Object.keys(bx).length == N * N) {
            return c.end(
                sc[0] == sc[1]
                    ? "It's a draw!"
                    : `${nm(sc[0] > sc[1] ? 1 : 2)} wins ${Math.max(...sc)}–${Math.min(...sc)}!`,
                sc[0] > sc[1] || (c.two && sc[0] != sc[1])
            );
        }

        if (!got) t = 3 - t;

        info();

        if (!c.two && t == 2) c.after(ai, 550);
    };

    const ai = () => {
        if (c.over) return;

        const fr = [...a.querySelectorAll('.edge')]
            .map(b => b.dataset.k)
            .filter(k => !e[k]);

        const gain = fr.filter(k =>
            adj(k).some(([y, z]) => sides(y, z) == 3)
        );

        const safe = fr.filter(k =>
            adj(k).every(([y, z]) => sides(y, z) < 2)
        );

        play(pick(gain.length ? gain : safe.length ? safe : fr));
    };

    a.onclick = ev => {
        const k = ev.target.dataset.k;

        if (!k || e[k] || c.over || (!c.two && t == 2)) return;

        play(k);
    };

    info();
};

/* INITIALIZE */

renderGames();
upd();
