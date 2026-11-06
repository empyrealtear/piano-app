
// 61键虚拟钢琴 —— 键位映射（高音在 F 键排，逐行向下：F排→数字排→QWET→ASD→ZXC）
// [音名, 按键显示, KeyboardEvent.code]
const WHITE_KEYS = [
	// 第1个八度：ZXCV 排（跳过 V）
	['C2', 'Z', 'KeyZ'], ['D2', 'X', 'KeyX'], ['E2', 'C', 'KeyC'],
	['F2', 'B', 'KeyB'], ['G2', 'N', 'KeyN'], ['A2', 'M', 'KeyM'], ['B2', ',', 'Comma'],
	// 第2个八度：ASDF 排
	['C3', 'A', 'KeyA'], ['D3', 'S', 'KeyS'], ['E3', 'D', 'KeyD'],
	['F3', 'F', 'KeyF'], ['G3', 'G', 'KeyG'], ['A3', 'H', 'KeyH'], ['B3', 'J', 'KeyJ'],
	// 第3个八度：QWET 排（跳过 R、Y）
	['C4', 'Q', 'KeyQ'], ['D4', 'W', 'KeyW'], ['E4', 'E', 'KeyE'],
	['F4', 'T', 'KeyT'], ['G4', 'U', 'KeyU'], ['A4', 'I', 'KeyI'], ['B4', 'O', 'KeyO'],
	// 第4个八度：数字排
	['C5', '1', 'Digit1'], ['D5', '2', 'Digit2'], ['E5', '3', 'Digit3'],
	['F5', '4', 'Digit4'], ['G5', '5', 'Digit5'], ['A5', '6', 'Digit6'], ['B5', '7', 'Digit7'],
	// 第5个八度：F 键排（1''-7''）
	['C6', 'F1', 'F1'], ['D6', 'F2', 'F2'], ['E6', 'F3', 'F3'],
	['F6', 'F4', 'F4'], ['G6', 'F5', 'F5'], ['A6', 'F6', 'F6'], ['B6', 'F7', 'F7'],
	// 最高音
	// ['C7', '', ''],
];

const BLACK_KEYS = [
	// 第1个八度黑键：ZXCV 排右侧 + 小键盘
	['C#2', '.', 'Period'], ['D#2', '/', 'Slash'], ['F#2', '⇧', 'ShiftRight'],
	['G#2', 'N0', 'Numpad0'], ['A#2', 'N.', 'NumpadDecimal'],
	// 第2个八度黑键：ASDF 排右侧 + 小键盘
	['C#3', 'K', 'KeyK'], ['D#3', 'L', 'KeyL'], ['F#3', ';', 'Semicolon'],
	['G#3', 'N2', 'Numpad2'], ['A#3', 'N3', 'Numpad3'],
	// 第3个八度黑键：QWET 排右侧 + 小键盘
	['C#4', 'P', 'KeyP'], ['D#4', '[', 'BracketLeft'], ['F#4', ']', 'BracketRight'],
	['G#4', 'N5', 'Numpad5'], ['A#4', 'N6', 'Numpad6'],
	// 第4个八度黑键：数字排后半 + 小键盘
	['C#5', '8', 'Digit8'], ['D#5', '9', 'Digit9'], ['F#5', '0', 'Digit0'],
	['G#5', 'N8', 'Numpad8'], ['A#5', 'N9', 'Numpad9'],
	// 第5个八度黑键：F8-F9 + 小键盘
	['C#6', 'F8', 'F8'], ['D#6', 'F9', 'F9'], ['F#6', 'F10', 'F10'],
	['G#6', '/', 'NumpadDivide'], ['A#6', '*', 'NumpadMultiply'],
];

// 简谱：音名 -> [数字, 上加点数, 下加点数]
// 规则（与用户约定一致）：C4=1无点，C3起每低一个八度下加2/3点，C5起每高一个八度上加1/2/3点
function jianpuOf(note) {
	const names = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
	const sharp = note.includes('#');
	const octave = parseInt(note.slice(-1));
	const digit = names.indexOf(note[0]) + 1;
	let dotsUp = 0, dotsDown = 0;
	if (octave > 4) dotsUp = octave - 4;
	else if (octave < 4) dotsDown = 4 - octave;
	return { text: (sharp ? '#' : '') + digit, dotsUp, dotsDown };
}

class Piano {
	constructor() {
		this.synth = null;
		this.reverb = null;
		this.volume = null;
		this.activeNotes = new Map();
		this.sustainOn = true;
		this.sustainedNotes = new Set();
		this.keyMap = {}; // KeyboardEvent.code -> MIDI

		// 读谱状态
		this.score = [];        // 解析后的谱面 [{token, midi|null, beats}]
		this.scoreIndex = 0;
		this.playTimer = null;
		this.followMode = false;

		this.init();
		this.createPianoKeys();
		this.setupSustainSwitch();
		this.setupKeyboardListeners();
		this.setupScorePanel();
	}

	async init() {
		try {
			await Tone.start();

			// Audio 钢琴采样：每小三度一个（C/D#/F#/A），覆盖 C2-A6
			const urls = {
				'C2': 'C2.mp3', 'D#2': 'Ds2.mp3', 'F#2': 'Fs2.mp3', 'A2': 'A2.mp3',
				'C3': 'C3.mp3', 'D#3': 'Ds3.mp3', 'F#3': 'Fs3.mp3', 'A3': 'A3.mp3',
				'C4': 'C4.mp3', 'D#4': 'Ds4.mp3', 'F#4': 'Fs4.mp3', 'A4': 'A4.mp3',
				'C5': 'C5.mp3', 'D#5': 'Ds5.mp3', 'F#5': 'Fs5.mp3', 'A5': 'A5.mp3',
				'C6': 'C6.mp3', 'D#6': 'Ds6.mp3', 'F#6': 'Fs6.mp3', 'A6': 'A6.mp3'
			};

			this.synth = new Tone.Sampler({
				urls: urls,
				baseUrl: './audio/',
				onerror: (e) => { console.error('Sound could not be loaded:', e); }
			});

			this.reverb = new Tone.Reverb({ decay: 4, wet: 0.2 });
			this.volume = new Tone.Volume(0);
			this.synth.connect(this.reverb);
			this.reverb.connect(this.volume);
			this.volume.toDestination();
		} catch (error) {
			console.error('Audio initialization failed:', error);
		}
	}

	noteToMidi(note) {
		const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		const octave = parseInt(note.slice(-1));
		const index = notes.indexOf(note.slice(0, -1));
		return (octave + 1) * 12 + index;
	}

	midiToNote(midiNote) {
		const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
		return notes[(midiNote - 12) % 12] + Math.floor((midiNote - 12) / 12);
	}

	createPianoKeys() {
		const piano = document.getElementById('piano');
		const unit = 100 / 36;
		const blackQueue = [...BLACK_KEYS];
		let whiteCount = 0;

		for (const [note, label, code] of WHITE_KEYS) {
			whiteCount++;
			this.createKey(piano, note, label, code, true);

			// 该白键右侧若有对应黑键（C->C#, D->D#, F->F#, G->G#, A->A#）
			const sharp = note[0] + '#' + note.slice(1);
			const idx = blackQueue.findIndex(b => b[0] === sharp);
			if (idx !== -1) {
				const [bNote, bLabel, bCode] = blackQueue.splice(idx, 1)[0];
				this.createKey(piano, bNote, bLabel, bCode, false, (whiteCount - 0.3) * unit, unit * 0.6);
			}
		}
	}

	createKey(piano, note, label, code, isWhite, leftPct, widthPct) {
		const midi = this.noteToMidi(note);
		this.keyMap[code] = midi;

		const wrapper = document.createElement('div');
		if (isWhite) {
			wrapper.className = 'white-cell';
		} else {
			wrapper.className = 'black-wrap';
			wrapper.style.left = `${leftPct}%`;
			wrapper.style.width = `${widthPct}%`;
		}

		const key = document.createElement('div');
		key.className = `key ${isWhite ? 'white-key' : 'black-key'}`;
		key.dataset.midi = midi;

		// 简谱标签（含上下加点）
		const jp = jianpuOf(note);
		const jpEl = document.createElement('span');
		jpEl.className = 'jianpu';
		if (jp.dotsUp) {
			const d = document.createElement('i');
			d.className = 'dots';
			d.textContent = '•'.repeat(jp.dotsUp);
			jpEl.appendChild(d);
		}
		const t = document.createElement('b');
		t.textContent = jp.text;
		jpEl.appendChild(t);
		if (jp.dotsDown) {
			const d = document.createElement('i');
			d.className = 'dots';
			d.textContent = '•'.repeat(jp.dotsDown);
			jpEl.appendChild(d);
		}

		// 按键徽章
		const badge = document.createElement('span');
		badge.className = 'key-badge';
		badge.textContent = label;

		key.append(jpEl, badge);
		wrapper.appendChild(key);
		piano.appendChild(wrapper);

		this.bindKeyEvents(key, midi);
	}

	bindKeyEvents(key, midi) {
		key.addEventListener('mousedown', (e) => {
			e.preventDefault();
			this.playNote(midi);
			key.classList.add('active');
			this.checkFollow(midi);
		});
		key.addEventListener('mouseup', () => {
			this.stopNote(midi);
			key.classList.remove('active');
		});
		key.addEventListener('mouseleave', () => {
			this.stopNote(midi);
			key.classList.remove('active');
		});
	}

	async playNote(midiNote) {
		if (!this.synth) {
			await this.init();
		}

		const noteName = this.midiToNote(midiNote);

		if (this.activeNotes.has(midiNote)) {
			this.stopNote(midiNote, true);
		}

		this.synth.triggerAttack(noteName);
		this.activeNotes.set(midiNote, noteName);
	}

	stopNote(midiNote, force = false) {
		if (!this.activeNotes.has(midiNote)) return;

		if (this.sustainOn && !force) {
			this.sustainedNotes.add(midiNote);
			return;
		}

		this.synth.triggerRelease(this.activeNotes.get(midiNote));
		this.activeNotes.delete(midiNote);
		this.sustainedNotes.delete(midiNote);
	}

	setSustain(on) {
		this.sustainOn = on;
		document.getElementById('sustain-switch').setAttribute('aria-checked', String(on));

		if (!on) {
			this.sustainedNotes.forEach(midiNote => {
				if (this.activeNotes.has(midiNote)) {
					this.synth.triggerRelease(this.activeNotes.get(midiNote));
					this.activeNotes.delete(midiNote);
				}
			});
			this.sustainedNotes.clear();
		}
	}

	setupSustainSwitch() {
		document.getElementById('sustain-switch').addEventListener('click', () => {
			this.setSustain(!this.sustainOn);
		});
	}

	setupKeyboardListeners() {
		const pressedKeys = new Set();

		document.addEventListener('keydown', (e) => {
			// 在输入框中打字时不触发琴键
			if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

			const midiNote = this.keyMap[e.code];
			if (midiNote === undefined) return;

			// 阻止浏览器默认行为（F1帮助、F5刷新、Tab切焦点、空格滚动等）
			e.preventDefault();
			if (e.repeat || pressedKeys.has(e.code)) return;

			pressedKeys.add(e.code);
			this.playNote(midiNote);

			const key = document.querySelector(`[data-midi="${midiNote}"]`);
			if (key) key.classList.add('active');

			this.checkFollow(midiNote);
		});

		document.addEventListener('keyup', (e) => {
			const midiNote = this.keyMap[e.code];
			if (midiNote === undefined) return;

			pressedKeys.delete(e.code);
			this.stopNote(midiNote);

			const key = document.querySelector(`[data-midi="${midiNote}"]`);
			if (key) key.classList.remove('active');
		});
	}

	/* ================= 读谱功能 ================= */

	setupScorePanel() {
		document.getElementById('score-play').addEventListener('click', () => this.startScore());
		document.getElementById('score-stop').addEventListener('click', () => this.stopScore());
		document.getElementById('score-mode').addEventListener('change', () => this.stopScore());
	}

	// 解析数字简谱文本：#开头升半音，尾部.低八度，'高八度，0休止，-延长一拍
	parseScore(text) {
		const tokens = text.match(/#?[0-7][.']*|[-~—–|]|\n/g) || [];
		const score = [];
		let latestToken = '';
		for (const tk of tokens) {
			let ltk = latestToken;
			latestToken = tk;
			if (ltk + tk === '\n\n')
				continue;
			if (/^([-~—–|]|\n)$/.test(tk)) {
				if (score.length) score[score.length - 1].beats++;
				continue;
			}
			const m = tk.match(/^(#?)([0-7])([.']*)$/);
			if (!m) continue;
			const [, sharpMark, digit, dots] = m;
			if (digit === '0') {
				score.push({ token: tk, midi: null, beats: 1 });
				continue;
			}
			const offsets = [0, 2, 4, 5, 7, 9, 11];
			let midi = 60 + offsets[parseInt(digit) - 1];
			if (sharpMark) midi += 1;
			for (const ch of dots) midi += ch === '.' ? -12 : 12;
			score.push({ token: tk, midi, beats: 1 });
		}
		return score;
	}

	renderScoreStrip() {
		const strip = document.getElementById('score-strip');
		strip.innerHTML = '';
		this.score.forEach((item, i) => {
			const chip = document.createElement('span');
			chip.className = 'score-chip';
			if (item.midi === null) chip.classList.add('rest');
			chip.textContent = item.token;
			chip.dataset.index = i;
			strip.appendChild(chip);
		});
	}

	highlightChip(i) {
		document.querySelectorAll('.score-chip.current').forEach(c => c.classList.remove('current'));
		const chip = document.querySelector(`.score-chip[data-index="${i}"]`);
		if (chip) {
			chip.classList.add('current');
			// 仅在谱面显示区内滚动定位，不牵动页面
			const strip = document.getElementById('score-strip');
			const target = chip.offsetTop - strip.clientHeight / 2 + chip.offsetHeight / 2;
			strip.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
		}
	}

	getKeyEl(midi) {
		return document.querySelector(`[data-midi="${midi}"]`);
	}

	async startScore() {
		this.stopScore();
		const text = document.getElementById('score-input').value;
		this.score = this.parseScore(text);
		if (!this.score.length) return;

		this.followMode = document.getElementById('score-mode').value === 'follow';
		this.scoreIndex = 0;
		this.renderScoreStrip();

		if (!this.synth) await this.init();

		if (this.followMode) {
			this.advanceFollow();
		} else {
			this.playStep();
		}
	}

	stopScore() {
		if (this.playTimer) {
			clearTimeout(this.playTimer);
			this.playTimer = null;
		}
		document.querySelectorAll('.score-chip.current').forEach(c => c.classList.remove('current'));
		document.querySelectorAll('.key.target').forEach(k => k.classList.remove('target'));
		this.scoreIndex = 0;
	}

	// ---- 自动播放 ----
	playStep() {
		if (this.scoreIndex >= this.score.length) {
			this.stopScore();
			return;
		}

		const item = this.score[this.scoreIndex];
		const msPerBeat = 60000 / (parseInt(document.getElementById('score-tempo').value) || 100);
		const duration = item.beats * msPerBeat;
		this.highlightChip(this.scoreIndex);
		
		if (item.midi !== null) {
			const key = this.getKeyEl(item.midi);
			this.playNote(item.midi);
			if (key) key.classList.add('active');
			this.playTimer = setTimeout(() => {
				this.stopNote(item.midi, true);
				if (key) key.classList.remove('active');
				this.scoreIndex++;
				this.playStep();
			}, duration * 0.92);
		} else {
			this.playTimer = setTimeout(() => {
				this.scoreIndex++;
				this.playStep();
			}, duration);
		}
	}

	// ---- 跟弹练习 ----
	advanceFollow() {
		// 跳过休止符
		while (this.scoreIndex < this.score.length && this.score[this.scoreIndex].midi === null) {
			this.scoreIndex++;
		}
		document.querySelectorAll('.key.target').forEach(k => k.classList.remove('target'));

		if (this.scoreIndex >= this.score.length) {
			this.stopScore();
			return;
		}

		this.highlightChip(this.scoreIndex);
		const key = this.getKeyEl(this.score[this.scoreIndex].midi);
		if (key) key.classList.add('target');
	}

	checkFollow(midi) {
		if (!this.followMode || !this.score.length || this.scoreIndex >= this.score.length) return;

		const expected = this.score[this.scoreIndex];
		if (midi === expected.midi) {
			this.scoreIndex++;
			this.advanceFollow();
		} else {
			// 弹错：红闪提示
			const key = this.getKeyEl(midi);
			if (key) {
				key.classList.add('wrong');
				setTimeout(() => key.classList.remove('wrong'), 200);
			}
		}
	}
}

// Initialize piano when page loads
document.addEventListener('DOMContentLoaded', () => {
	new Piano();
});

// Handle page visibility for audio context
document.addEventListener('visibilitychange', () => {
	if (document.hidden) {
		const activeKeys = document.querySelectorAll('.key.active');
		activeKeys.forEach(key => key.classList.remove('active'));
	}
});
