// グローバルに展開
phina.globalize();

// 定数
const SCREEN_WIDTH = 640;                           // 画面横サイズ
const SCREEN_HEIGHT = 960;                          // 画面縦サイズ
const PIECE_NUM_XY = 4;                             // 縦横のピース数
const GRID_SIZE = SCREEN_WIDTH / PIECE_NUM_XY;      // グリッドのサイズ
const PIECE_SIZE = GRID_SIZE * 0.95;                // ピースの大きさ
const PIECE_OFFSET = GRID_SIZE / 2;                 // オフセット値

phina.define('MainScene', {
    superClass: 'DisplayScene',

    // コンストラクタ
    init: function () {
        this.superInit();

        // メインシーンの背景色
        this.backgroundColor = 'gray';

        // 4x4のグリッド
        const grid = Grid(SCREEN_WIDTH, PIECE_NUM_XY);

        // ピースをまとめるやつ
        const pieceGroup = DisplayElement().addChildTo(this);
        this.pieceGroup = pieceGroup;
        const scene = this;

        // ピースを生成する二重のループ
        PIECE_NUM_XY.times((spanX) => {
            PIECE_NUM_XY.times((spanY) => {
                const num = spanY * PIECE_NUM_XY + spanX + 1;
                const piece = Piece(num).addChildTo(pieceGroup);
                piece.x = grid.span(spanX) + PIECE_OFFSET;
                piece.y = grid.span(spanY) + PIECE_OFFSET;

                // 正しい位置を記憶させておく
                piece.correctX = piece.x;
                piece.correctY = piece.y;

                // タッチを有効にする
                piece.setInteractive(true);

                // タッチされた時の処理
                piece.onpointend = function () {
                    scene.movePiece(this);
                };

                if (num === 16) {
                    piece.hide();
                }
            });
        });

        // シャッフルボタン
        const shuffleButton = Button({
            text: 'SHUFFLE'
        }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(13));

        // 1回でも押されたかどうかフラグ
        shuffleButton.isPushed = false;

        // シャッフルボタンが押されたとき
        shuffleButton.onpush = function () {
            (100).times(() => {
                scene.shufflePieces();
            });

            // 残りステップリセット
            scene.step = 200;

            // 押されたフラグ
            this.isPushed = true;
        };
        this.shuffleButton = shuffleButton; //参照用

    },
    getBlankPiece: function () {
        let result = null;
        this.pieceGroup.children.some((piece) => {
            if (piece.num === 16) {
                result = piece;
                return true;
            }
        });

        return result;
    },
    movePiece: function (piece, isInstantly) {
        const scene = this;

        // 空白(16番)のピースを取る
        const blank = this.getBlankPiece();

        // 即入れ替え
        if (isInstantly) {
            const tx = piece.x;
            const ty = piece.y;
            piece.setPosition(blank.x, blank.y);
            blank.setPosition(tx, ty);
            return;
        }

        // 2ピース間の座標の差を求める
        const dx = Math.abs(piece.x - blank.x);
        const dy = Math.abs(piece.y - blank.y);

        if (piece.x === blank.x && dy === GRID_SIZE ||
            piece.y === blank.y && dx === GRID_SIZE) {
            const tx = piece.x;
            const ty = piece.y;

            // tweenerで移動
            piece.tweener.clear()
                .to({x: blank.x, y: blank.y}, 200, "easeOutCubic")
                .call(() => {
                    blank.setPosition(tx, ty);

                    // 残りステップ数を減らす
                    scene.step--;

                    // クリアチェック
                    if (scene.shuffleButton.isPushed) {
                        scene.checkPiecePosition()
                    }
                });
        }
    },
    getPieceByXY: function (x, y) {
        let result = null;
        this.pieceGroup.children.some((piece) => {
            if (piece.x === x && piece.y === y) {
                result = piece;
                return true;
            }
        });

        return result;
    },
    shufflePieces: function() {
        const scene = this;     // メインシーン参照用

        // 隣接ピース格納用
        const pieces = [];
        // 空白ピースを得る
        const blank = this.getBlankPiece();

        [1, 0, -1].each((i) => {
            [1, 0, -1].each((j) => {
                if (i !== j) {
                    const x = blank.x + i * GRID_SIZE;
                    const y = blank.y + j * GRID_SIZE;
                    const target = scene.getPieceByXY(x, y);
                    if (target) {
                        pieces.push(target);
                    }
                }
            });
        });
        this.movePiece(pieces.random(), 'instantly');
    },
    checkPiecePosition: function() {
        const result = this.pieceGroup.children.some((piece) => {
            return (piece.x !== piece.correctX || piece.y !== piece.correctY)
        });
        if (!result) {
            const score = this.step;
            this.exit({
                score: score,
                message: '15 Puzzle Clear!'
            })
        }
    }
});

phina.define('Piece', {
    superClass: 'RectangleShape',

    // コンストラクタ
    init: function (num) {
        this.superInit({
            width: PIECE_SIZE,
            height: PIECE_SIZE,
            cornerRadius: 10,
            fill: 'silver',
            stroke: 'white',
        });

        this.num = num;

        this.label = Label({
            text: this.num,
            fontSize: PIECE_SIZE * 0.8,
            fill: 'white',
            fontFamily: 'Impact',
        }).addChildTo(this);
    }
});

phina.main(() => {
    const app = GameApp({
        title: "15パズル",
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
    });

    app.run();
});