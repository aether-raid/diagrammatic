import * as assert from 'assert';
import * as vscode from 'vscode';
import { getFunctionDescriptions } from '../functionDescriptions/runFunctionDescriptionsAlgorithm'; // Adjust path
import { NodeEdgeData } from '@shared/app.types';
import { EntityNode } from '@shared/node.types';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('getFunctionDescriptions returns expected functions', async () => {
		const mockGenerateResponse = async () => [{
			node_id: 'node1',
			class_name: 'ExampleClass',
			class_description: 'Example desc',
			functions: [{
				function_name: 'greet',
				function_description: 'Greets someone',
				parameters: [{
					inputName: 'name',
					inputType: 'string',
					description: 'User name',
				}],
				output: {
					outputName: 'result',
					outputType: 'string',
					description: 'Greeting message'
				}
			}]
		}];

		const mockLLMProvider = { generateResponse: mockGenerateResponse };

		const mockNode: EntityNode = {
			id: 'node1',
			type: 'entity',
			data: {
			  entityName: 'SomeClass',
			  entityType: 'class',
			  items: [],
			  startPosition: { row: 1, column: 0 },
			  endPosition: { row: 10, column: 1 },
			  filePath: '/fake/path.ts',
			},
			position: { x: 0, y: 0 }
		  };

		const mockNodeEdgeData: NodeEdgeData = {
			nodes: [mockNode],
			edges: []
		};

		// Mock fs.promises.readFile
		const fs = await import('fs/promises');
		const originalReadFile = fs.readFile;
		(fs.readFile as any) = async (path: string, encoding: string) => `
			import hello from './utils';
			export function greet(name: string): string {
				return "Hi " + name;
			}
		` as any;

		const result = await getFunctionDescriptions(mockLLMProvider as any, mockNodeEdgeData, 'node1');
		assert.ok(result);
		assert.strictEqual(result?.[0].function_name, 'greet');

		// Restore original readFile
		fs.readFile = originalReadFile;
	});
});