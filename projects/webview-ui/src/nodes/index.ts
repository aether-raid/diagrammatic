import { NodeTypes } from "@xyflow/react";

import { TextUpdaterNode } from "./components/TextUpdaterNode";
import { EntityNode } from "./components/EntityNode";
import { AppNode } from "@shared/node.types";
class Position {

    /**
     * The zero-based line value.
     */
    readonly line: number;

    /**
     * The zero-based character value.
     */
    readonly character: number;

    /**
     * @param line A zero-based line value.
     * @param character A zero-based character value.
     */
    constructor(line: number, character: number);

    /**
     * Check if this position is before `other`.
     *
     * @param other A position.
     * @returns `true` if position is on a smaller line
     * or on the same line on a smaller character.
     */
    isBefore(other: Position): boolean;

    /**
     * Check if this position is before or equal to `other`.
     *
     * @param other A position.
     * @returns `true` if position is on a smaller line
     * or on the same line on a smaller or equal character.
     */
    isBeforeOrEqual(other: Position): boolean;

    /**
     * Check if this position is after `other`.
     *
     * @param other A position.
     * @returns `true` if position is on a greater line
     * or on the same line on a greater character.
     */
    isAfter(other: Position): boolean;

    /**
     * Check if this position is after or equal to `other`.
     *
     * @param other A position.
     * @returns `true` if position is on a greater line
     * or on the same line on a greater or equal character.
     */
    isAfterOrEqual(other: Position): boolean;

    /**
     * Check if this position is equal to `other`.
     *
     * @param other A position.
     * @returns `true` if the line and character of the given position are equal to
     * the line and character of this position.
     */
    isEqual(other: Position): boolean;

    /**
     * Compare this to `other`.
     *
     * @param other A position.
     * @returns A number smaller than zero if this position is before the given position,
     * a number greater than zero if this position is after the given position, or zero when
     * this and the given position are equal.
     */
    compareTo(other: Position): number;

    /**
     * Create a new position relative to this position.
     *
     * @param lineDelta Delta value for the line value, default is `0`.
     * @param characterDelta Delta value for the character value, default is `0`.
     * @returns A position which line and character is the sum of the current line and
     * character and the corresponding deltas.
     */
    translate(lineDelta?: number, characterDelta?: number): Position;

    /**
     * Derived a new position relative to this position.
     *
     * @param change An object that describes a delta to this position.
     * @returns A position that reflects the given delta. Will return `this` position if the change
     * is not changing anything.
     */
    translate(change: {
        /**
         * Delta value for the line value, default is `0`.
         */
        lineDelta?: number;
        /**
         * Delta value for the character value, default is `0`.
         */
        characterDelta?: number;
    }): Position;

    /**
     * Create a new position derived from this position.
     *
     * @param line Value that should be used as line value, default is the {@link Position.line existing value}
     * @param character Value that should be used as character value, default is the {@link Position.character existing value}
     * @returns A position where line and character are replaced by the given values.
     */
    with(line?: number, character?: number): Position;

    /**
     * Derived a new position from this position.
     *
     * @param change An object that describes a change to this position.
     * @returns A position that reflects the given change. Will return `this` position if the change
     * is not changing anything.
     */
    with(change: {
        /**
         * New line value, defaults the line value of `this`.
         */
        line?: number;
        /**
         * New character value, defaults the character value of `this`.
         */
        character?: number;
    }): Position;
}
class Range {

    /**
     * The start position. It is before or equal to {@link Range.end end}.
     */
    readonly start: Position;

    /**
     * The end position. It is after or equal to {@link Range.start start}.
     */
    readonly end: Position;

    /**
     * Create a new range from two positions. If `start` is not
     * before or equal to `end`, the values will be swapped.
     *
     * @param start A position.
     * @param end A position.
     */
    constructor(start: Position, end: Position);

    /**
     * Create a new range from number coordinates. It is a shorter equivalent of
     * using `new Range(new Position(startLine, startCharacter), new Position(endLine, endCharacter))`
     *
     * @param startLine A zero-based line value.
     * @param startCharacter A zero-based character value.
     * @param endLine A zero-based line value.
     * @param endCharacter A zero-based character value.
     */
    constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number);

    /**
     * `true` if `start` and `end` are equal.
     */
    isEmpty: boolean;

    /**
     * `true` if `start.line` and `end.line` are equal.
     */
    isSingleLine: boolean;

    /**
     * Check if a position or a range is contained in this range.
     *
     * @param positionOrRange A position or a range.
     * @returns `true` if the position or range is inside or equal
     * to this range.
     */
    contains(positionOrRange: Position | Range): boolean;

    /**
     * Check if `other` equals this range.
     *
     * @param other A range.
     * @returns `true` when start and end are {@link Position.isEqual equal} to
     * start and end of this range.
     */
    isEqual(other: Range): boolean;

    /**
     * Intersect `range` with this range and returns a new range or `undefined`
     * if the ranges have no overlap.
     *
     * @param range A range.
     * @returns A range of the greater start and smaller end positions. Will
     * return undefined when there is no overlap.
     */
    intersection(range: Range): Range | undefined;

    /**
     * Compute the union of `other` with this range.
     *
     * @param other A range.
     * @returns A range of smaller start position and the greater end position.
     */
    union(other: Range): Range;

    /**
     * Derived a new range from this range.
     *
     * @param start A position that should be used as start. The default value is the {@link Range.start current start}.
     * @param end A position that should be used as end. The default value is the {@link Range.end current end}.
     * @returns A range derived from this range with the given start and end position.
     * If start and end are not different `this` range will be returned.
     */
    with(start?: Position, end?: Position): Range;

    /**
     * Derived a new range from this range.
     *
     * @param change An object that describes a change to this range.
     * @returns A range that reflects the given change. Will return `this` range if the change
     * is not changing anything.
     */
    with(change: {
        /**
         * New start position, defaults to {@link Range.start current start}
         */
        start?: Position;
        /**
         * New end position, defaults to {@link Range.end current end}
         */
        end?: Position;
    }): Range;
}


export const initialNodes: AppNode[] = [
  {
    id: '5',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      description: 'This file serves as a central entity that manages multiple agricultural components. It coordinates the planting & harvesting processes.',
      entityName: 'Farm',
      entityType: 'file',
      filePath: 'path/to/farm',
      items: [
        { name: 'Planter', lineNumber: 15 },
        { name: 'Harvester', lineNumber: 45 },
      ],
    security: {
        clean: [],
        vulnerability: [{range: new Range(26, 32, 3, 3), message: 'Variable Assigned to Object Injection Sink', severity: 1, source: 'Group: security'}],
        extras: []
    }
    }
  },
  {
    id: '5a',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      description: 'This class is responsible for crop planting. It encapsulates the various functions required to plant crops.',
      entityName: 'Planter',
      entityType: 'class',
      filePath: 'path/to/planter',
      items: [
        { name: 'plantPotato', lineNumber: 0 },
        { name: 'plantCorn', lineNumber: 20 },
        { name: 'plantCarrot', lineNumber: 40 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '5b',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      description: 'This class is responsible for harvesting crops once they are ready. It encapsulates the various functions required to harvest different crops.',
      entityName: 'Harvester',
      entityType: 'class',
      filePath: 'path/to/harvester',
      items: [
        { name: 'harvestPotato', lineNumber: 0 },
        { name: 'harvestCorn', lineNumber: 20 },
        { name: 'harvestCarrot', lineNumber: 40 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '6',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Grocer',
      entityType: 'file',
      filePath: 'path/to/grocer',
      items: [
        { name: 'sellProduct', lineNumber: 0 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '7',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Customer',
      entityType: 'file',
      filePath: 'path/to/customer',
      items: [
        { name: 'consumePotato', lineNumber: 15 },
        { name: 'consumeCorn', lineNumber: 36 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '8',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Gift',
      entityType: 'file',
      filePath: 'path/to/gift',
      items: [
        { name: 'givePotato', lineNumber: 0 },
        { name: 'giveCorn', lineNumber: 32 },
        { name: 'cookAndGiveDish', lineNumber: 77 }
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: []
    }
    }
  },
  {
    id: '9',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Food',
      entityType: 'interface',
      filePath: 'path/to/food',
      items: [
        { name: 'eatPotato', lineNumber: 0 },
        { name: 'eatCorn', lineNumber: 32 },
      ]
    }
  },
  {
    id: '10',
    type: 'entity',
    position: { x:0, y:0 },
    data: {
      entityName: 'Bin',
      entityType: 'namespace',
      filePath: 'path/to/bin',
      items: [
        { name: 'yeetPotato', lineNumber: 0 },
        { name: 'yeetCorn', lineNumber: 32 },
      ]
    }
  }
];

export const nodeTypes = {
    'entity': EntityNode,
    'textUpdater': TextUpdaterNode
} satisfies NodeTypes;