import {spawn} from 'node:child_process';
import {
    access,
    cp,
    mkdir,
    mkdtemp,
    readdir,
    readFile,
    rm,
    writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fragmentSourceDirectory = path.join(projectDirectory, 'fragments');
const outputDirectory = path.join(projectDirectory, 'build', 'fragments');
const outputPath = path.join(outputDirectory, 'collections-nexcent-components.zip');
const collectionKey = 'nexcent-components';
const deployDescriptor = {
    companyWebId: process.env.NEXCENT_FRAGMENTS_COMPANY_WEB_ID || 'nexcent.com',
    groupKey: process.env.NEXCENT_FRAGMENTS_GROUP_KEY || 'Next Gen Site',
};

function run(command, args, options = {}) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {stdio: 'inherit', ...options});

        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) {
                resolve();
            }
            else {
                reject(new Error(`${command} exited with code ${code}`));
            }
        });
    });
}

async function resolveJarCommand() {
    if (process.env.JAVA_HOME) {
        const javaHomeJar = path.join(
            process.env.JAVA_HOME,
            'bin',
            process.platform === 'win32' ? 'jar.exe' : 'jar'
        );

        try {
            await access(javaHomeJar);
            return javaHomeJar;
        }
        catch {
            // Fall through to PATH lookup when JAVA_HOME does not contain the JDK tool.
        }
    }

    return 'jar';
}

const collectionPath = path.join(fragmentSourceDirectory, 'collection.json');
const collection = JSON.parse(await readFile(collectionPath, 'utf8'));

if (!collection.name) {
    throw new Error(`Invalid Fragment Set descriptor: ${collectionPath}`);
}

const fragmentEntries = (await readdir(fragmentSourceDirectory, {withFileTypes: true}))
    .filter((entry) => entry.isDirectory())
    .sort((left, right) => left.name.localeCompare(right.name));

if (fragmentEntries.length === 0) {
    throw new Error(`No fragment directories found in: ${fragmentSourceDirectory}`);
}

for (const entry of fragmentEntries) {
    const fragmentDirectory = path.join(fragmentSourceDirectory, entry.name);
    const fragmentDefinitionPath = path.join(fragmentDirectory, 'fragment.json');
    const fragmentDefinition = JSON.parse(await readFile(fragmentDefinitionPath, 'utf8'));

    for (const propertyName of ['htmlPath', 'cssPath', 'jsPath', 'configurationPath']) {
        const referencedFile = fragmentDefinition[propertyName];

        if (referencedFile) {
            await readFile(path.join(fragmentDirectory, referencedFile));
        }
    }
}

await rm(outputDirectory, {force: true, recursive: true});
await mkdir(outputDirectory, {recursive: true});

const stagingDirectory = await mkdtemp(path.join(os.tmpdir(), 'nexcent-fragments-'));
const stagedCollectionDirectory = path.join(stagingDirectory, collectionKey);
const stagedFragmentsDirectory = path.join(stagedCollectionDirectory, 'fragments');

try {
    await mkdir(stagedFragmentsDirectory, {recursive: true});
    await cp(collectionPath, path.join(stagedCollectionDirectory, 'collection.json'));
    await writeFile(
        path.join(stagingDirectory, 'liferay-deploy-fragments.json'),
        `${JSON.stringify(deployDescriptor, null, 2)}\n`
    );

    for (const entry of fragmentEntries) {
        await cp(
            path.join(fragmentSourceDirectory, entry.name),
            path.join(stagedFragmentsDirectory, entry.name),
            {recursive: true}
        );
    }

    const jarCommand = await resolveJarCommand();
    await run(jarCommand, ['--create', '--file', outputPath, '-C', stagingDirectory, '.']);
}
finally {
    await rm(stagingDirectory, {force: true, recursive: true});
}

console.log(`Packaged ${fragmentEntries.length} fragments to ${outputPath}`);
