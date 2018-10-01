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

        // ピースを生成する二重のループ
        PIECE_NUM_XY.times((spanX) => {
            PIECE_NUM_XY.times((spanY) => {
                const num = spanX * PIECE_NUM_XY + spanY + 1;
                const piece = Piece(num).addChildTo(pieceGroup);
                piece.x = grid.span(spanX) + PIECE_OFFSET;
                piece.y = grid.span(spanY) + PIECE_OFFSET;

                if (num === 16) {
                    piece.hide();
                }
            });
        });
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