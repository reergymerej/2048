(function () {
    'use strict';

    var app = {

        init: function () {
        
            this.setUpFramework();
            console.log(this.grid.toString());

            // start game
        },

        setUpFramework: function () {
            this.definePrototypes();
            this.grid = new this.Grid(4, 4);
        },

        definePrototypes: function () {
            this.Grid.prototype.toString = function () {
                var r, rows = [];

                for (r = 0; r < this.rows; r++) {
                    rows.push(this.row(r).join(' '));
                }

                return rows.join('\n');
            };

            this.Grid.prototype.column = function (x) {
                var i, column;

                if (x < this.columns && x >= 0) {
                    column = [];
                    for (i = 0; i < this.rows; i++) {
                        column.push(this.grid[i][x]);
                    }
                    
                }

                return column;
            };

            this.Grid.prototype.row = function (x) {
                return this.grid[x];
            };

            this.Square.prototype.toString = function () {
                return '[' + this.column + ', ' + this.row +
                    ' (' + this.value + ')]';
            };
        },

        Grid: function (columns, rows) {
            var c, r, row;

            this.columns = columns;
            this.rows = rows;

            // build an array to represent the grid
            this.grid = [];
            for (r = 0; r < rows; r++) {
                row = [];
                for (c = 0; c < columns; c++) {
                    row.push(new app.Square(r, c));
                }
                this.grid.push(row);
            }
        },

        Square: function (column, row) {
            this.column = column;
            this.row = row;
            this.value = 0;
        },

        grid: undefined
    };

    app.init();
}());