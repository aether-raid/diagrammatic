import { NodeTypes } from "@xyflow/react";

import { TextUpdaterNode } from "./components/TextUpdaterNode";
import { EntityNode } from "./components/EntityNode";
import { EntityCompNode } from "./components/EntityCompNode";
import { AppNode, NodeType } from "@shared/node.types";

export const initialNodes: AppNode[] = [
  {
    id: "5",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      description:
        "This file serves as a central entity that manages multiple agricultural components. It coordinates the planting & harvesting processes.",
      entityName: "Farm",
      entityType: "file",
      filePath:
        "path/to/farm/this/is/an/intentionally/very/long/path/lets/see/how/this/looks/like",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "Planter",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.ATTRIBUTE,
        },
        {
          name: "Harvester",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.ATTRIBUTE,
        },
      ],
      security: {
        clean: [
          {
            range: {
              start: { line: 26, character: 32 },
              end: { line: 3, character: 3 },
            },
            message: "Security.clean Object",
            severity: 1,
            source: "Group: security",
          },
          {
            range: {
              start: { line: 26, character: 32 },
              end: { line: 3, character: 3 },
            },
            message: "Security.dirty Object",
            severity: 1,
            source: "Group: security",
          },
          {
            range: {
              start: { line: 52, character: 32 },
              end: { line: 3, character: 3 },
            },
            message: "About to implode...",
            severity: 0,
            source: "Group: security",
          },
        ],
        vulnerability: [
          {
            range: {
              start: { line: 26, character: 32 },
              end: { line: 3, character: 3 },
            },
            message:
              "Variable Assigned to Object Injection Sink Lorem ipsum potato ramen I like long issues what the testing data",
            severity: 1,
            source: "Group: vulnerability",
          },
        ],
        extras: [],
      },
    },
  },
  {
    id: "5a",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      description:
        "This class is responsible for crop planting. It encapsulates the various functions required to plant crops.",
      entityName: "Planter",
      entityType: "class",
      filePath: "path/to/planter",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "plantPotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "plantCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "plantCarrot",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: [],
      },
    },
  },
  {
    id: "5b",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      description:
        "This class is responsible for harvesting crops once they are ready. It encapsulates the various functions required to harvest different crops.",
      entityName: "Harvester",
      entityType: "class",
      filePath: "path/to/harvester",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "harvestPotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "harvestCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "harvestCarrot",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: [],
      },
    },
  },
  {
    id: "6",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entityName: "Grocer",
      entityType: "file",
      filePath: "path/to/grocer",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "sellProduct",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: [],
      },
    },
  },
  {
    id: "7",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entityName: "Customer",
      entityType: "file",
      filePath: "path/to/customer",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "consumePotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "consumeCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: [],
      },
    },
  },
  {
    id: "8",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entityName: "Gift",
      entityType: "file",
      filePath: "path/to/gift",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "givePotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "giveCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "cookAndGiveDish",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
      security: {
        clean: [],
        vulnerability: [],
        extras: [],
      },
    },
  },
  {
    id: "9",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entityName: "Food",
      entityType: "interface",
      filePath: "path/to/food",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "eatPotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "eatCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
    },
  },
  {
    id: "10",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entityName: "Bin",
      entityType: "namespace",
      filePath: "path/to/bin",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "yeetPotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "yeetCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
    },
  },
  {
    id: "11",
    type: "entity",
    position: { x: 0, y: 0 },
    data: {
      entityName: "Bin",
      entityType: "struct",
      filePath: "path/to/bin",
      startPosition: { row: 15, column: 25 },
      endPosition: { row: 19, column: 30 },
      items: [
        {
          name: "structPotato",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
        {
          name: "structCorn",
          startPosition: { row: 0, column: 0 },
          endPosition: { row: 0, column: 0 },
          type: NodeType.FUNCTION,
        },
      ],
    },
  },
];

export const initialCompNodes: AppNode[] = [
  {
    id: '0',
    type: "componentEntity",
    position: { x: 0, y: 0 },
    data: {
      name: "Article Component",
      description: "Handles article related functionalities.",
      files: [
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.controller.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.entity.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.module.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\article.service.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\comment.entity.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\dto\\create-article.dto.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\article\\dto\\create-comment.ts",
      ],
    },
  },
  {
    id: '1',
    type: "componentEntity",
    position: { x: 0, y: 0 },
    data: {
      name: "Profile Component",
      description: "Manages user profiles and following/unfollowing.",
      files: [
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\follows.entity.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.controller.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.module.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\profile\\profile.service.ts",
      ],
    },
  },
  {
    id: '2',
    type: "componentEntity",
    position: { x: 0, y: 0 },
    data: {
      name: "Tag Component",
      description: "Handles tag management.",
      files: [
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.controller.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.entity.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.module.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\tag\\tag.service.ts",
      ],
    },
  },
  {
    id: '3',
    type: "componentEntity",
    position: { x: 0, y: 0 },
    data: {
      name: "User Component",
      description: "Handles user authentication and management.",
      files: [
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\auth.middleware.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\dto\\create-user.dto.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\dto\\login-user.dto.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\dto\\update-user.dto.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.controller.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.entity.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.module.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\user\\user.service.ts",
      ],
    },
  },
  {
    id: '4',
    type: "componentEntity",
    position: { x: 0, y: 0 },
    data: {
      name: "Shared Component",
      description: "Contains shared components and utilities.",
      files: [
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\shared\\base.controller.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\shared\\pipes\\validation.pipe.ts",
      ],
    },
  },
  {
    id: '5',
    type: "componentEntity",
    position: { x: 0, y: 0 },
    data: {
      name: "Application Component",
      description: "Main application module.",
      files: [
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\app.controller.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\app.module.ts",
        "c:\\Users\\ASUS\\Desktop\\FYP\\nestjs-realworld-example-app\\src\\main.ts",
      ],
    },
  },
];

export const nodeTypes = {
  'entity': EntityNode,
  'textUpdater': TextUpdaterNode,
  'componentEntity': EntityCompNode,
} satisfies NodeTypes;
