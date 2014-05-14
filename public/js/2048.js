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

                this.grid.eachRow(function (row) {
                    var column = 0,
                        square,
                        squareValue,
                        emptySquare,
                        mergableSquare,
                        movingSquare,
                        i,
                        targetSquareValue,
                        afterEmptySquare,
                        potentialMergable,
                        lastMergeIndex,
                        squareMoved;

                    // Find the first square with a value.
                    for (; column < row.length; column++) {
                        square = row[column];
                        squareValue = square.value();
                        squareMoved = false;

                        if (squareValue) {
                            movingSquare = square;

                            // Find the furthest empty square in the direction
                            // of movement and the first potential mergable.
                            i = column - 1;
                            targetSquareValue = 0;
                            potentialMergable = null;
                            while (i >= 0) {
                                targetSquareValue = row[i].value();
                                if (!targetSquareValue) {
                                    emptySquare = row[i];
                                } else if (!potentialMergable) {
                                    // TODO: If this guy just merged, we can't
                                    // merge again.  We have to test this.
                                    potentialMergable = row[i];
                                }

                                i--;
                            }

                            // Try to merge.
                            if (potentialMergable) {

                                // Make sure we didn't just merge this one.
                                if (lastMergeIndex !== potentialMergable.column) {

                                        if (potentialMergable.merge(square)) {
                                            lastMergeIndex = potentialMergable.column;
                                            squareMoved = true;
                                            
                                        }
                                }
                            }

                            if (emptySquare && !squareMoved) {
                                emptySquare.merge(square);
                                squareMoved = true;
                            }
                        }
                    }
                });

                success = true;
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

            /**
            * Merges this square's value with another's.
            * Clears other's value.
            * @return {Boolean} success
            */
            Square.merge = function (square) {
                var squareValue = square.value(),
                    value = this.value(),
                    success = false;

                if (!value || squareValue === value) {
                    this.value(squareValue + value);
                    square.value(0);
                    success = true;
                }

                return success;
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