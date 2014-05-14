(function () {
    'use strict';

    var app = {

        init: function () {
        
            this.setUpFramework();
            this.grid.display();

            // start game
            this.start();
        },

        setUpFramework: function () {
            this.definePrototypes();
            this.grid = new this.Grid(4, 4, $('#grid'));
        },

        // Start a new game.
        start: function () {
            var that = this;
            this.topValue = 0;
            this.grid.display();
            this.grid.add();

            // TODO: Clear this at the end of the game or set up 
            // one at the beginning.
            $('body').keydown(function (event) {
                var direction = that.KEYS[event.which];
                
                if (direction) {

                    // Attempt to move and then check to see if the
                    // game is over.
                    if (that.move(direction) &&
                        !that.grid.add() || this.topValue === 2048) {
                            console.log('game over');
                        }
                }
            });
        },

        /**
        * @param {String} direction n,e,w, or s
        * @return {Boolean} move completed
        */
        move: function (direction) {
            var success;

            if (direction === 'w') {

                if (this.grid.hasMove(direction)) {
                    this.grid.eachRow(function (row) {
                        var column = 0,
                            square,
                            firstEmpty,
                            squareValue;

                        for (; column < row.length; column++) {
                            square = row[column];
                            squareValue = square.value();

                            if (!squareValue) {
                                firstEmpty = firstEmpty || square;
                            }

                            if (firstEmpty && squareValue) {
                                firstEmpty.value(squareValue);
                                square.value(0);
                            }
                        }
                    });

                    success = true;
                }
            } else {
                success = true;
            }

            return success;
        },

        definePrototypes: function () {

            var Grid = this.Grid.prototype,
                Square = this.Square.prototype;

            Grid.toString = function () {
                var r, rows = [];

                for (r = 0; r < this.rows; r++) {
                    rows.push(this.row(r).join(' '));
                }

                return rows.join('\n');
            };

            Grid.column = function (x) {
                var i, column;

                if (x < this.columns && x >= 0) {
                    column = [];
                    for (i = 0; i < this.rows; i++) {
                        column.push(this.grid[i][x]);
                    }
                    
                }

                return column;
            };

            Grid.row = function (x) {
                return this.grid[x];
            };

            /**
            * Add a value to one of the random "empty" squares.
            * @return {Boolean} a value was added to the board
            */
            Grid.add = function () {
                var square = this.getEmptySquare();
                if (square) {
                    square.value(Math.random() < 0.5 ? 2 : 4);
                }

                return !!square;
            };

            Grid.getEmptySquare = function () {
                var empties = [];
                this.each(function (square) {
                    if (!square.value()) {
                        empties.push(square);
                    }
                });

                if (empties.length) {
                    return empties[app.rand(0, empties.length - 1)];
                }
            };

            Grid.each = function (fn) {
                var c;

                this.eachRow(function (row) {
                    for (c = 0; c < row.length; c++) {
                        fn(row[c]);
                    }
                });
            };

            Grid.eachRow = function (fn) {
                var r;

                for (r = 0; r < this.rows; r++) {
                    fn(this.row(r));
                }
            };

            Grid.display = function () {
                console.log('-------------------');
                console.log(this.toString());
            };

            Grid.buildDomGrid = function () {
                var el = this.el,
                    rowEl,
                    row = 0,
                    rowArr = [],
                    column,
                    squareEl;

                for (; row < this.rows; row++) {
                    rowEl = $('<div>', {
                        class: 'row'
                    }).appendTo(el);

                    rowArr = this.row(row);

                    for (column = 0; column < rowArr.length; column++) {
                        squareEl = $('<div>', {
                            class: 'square'
                        });
                        rowEl.append(squareEl);
                        rowArr[column].el = squareEl;
                    }
                }
            };

            Grid.hasMove = function (direction) {
                return true;
            };

            Square.toString = function () {
                return '[' + this.column + ', ' + this.row +
                    ' (' + this.value() + ')]';
            };

            Square.value = function (x) {
                if (x === undefined) {
                    return this.val;
                } else {
                    this.val = x;
                    app.topValue = Math.max(app.topValue, this.val);
                    this.el.html(this.val || '');
                }
            };
        },

        Grid: function Grid (columns, rows, el) {
            var c, r, row;

            this.columns = columns;
            this.rows = rows;
            this.el = el;

            // build an array to represent the grid
            this.grid = [];
            for (r = 0; r < rows; r++) {
                row = [];
                for (c = 0; c < columns; c++) {
                    row.push(new app.Square(c, r));
                }
                this.grid.push(row);
            }

            this.buildDomGrid();
        },

        Square: function Square (column, row) {
            this.column = column;
            this.row = row;
            this.val = 0;
        },

        rand: function (min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },

        grid: undefined,
        
        topValue: undefined,

        KEYS: {
            38: 'n',
            39: 'e',
            37: 'w',
            40: 's'
        }
    };

    $(function () {
        app.init();
    });
}());