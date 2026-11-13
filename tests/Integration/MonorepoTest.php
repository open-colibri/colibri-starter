<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Tests\Integration;

use PHPUnit\Framework\TestCase;
use OpenColibri\Starter\Monorepo\Monorepo;

final class MonorepoTest extends TestCase
{
    private Monorepo $monorepo;

    protected function setUp(): void
    {
        $this->monorepo = new Monorepo(\dirname(__DIR__, 2));
    }

    public function testTheMonorepoIsValid(): void
    {
        static::assertSame([], $this->monorepo->validate());
    }

    public function testCoreIsTheFirstPackage(): void
    {
        static::assertSame('open-colibri/starter-core', $this->monorepo->packages()[0]['name']);
    }

    public function testRootComposerReplacesEveryPackage(): void
    {
        $replace = $this->monorepo->rootComposer()['replace'] ?? [];

        foreach ($this->monorepo->packages() as $package) {
            static::assertSame('self.version', $replace[$package['name']] ?? null, $package['name']);
        }
    }

    public function testItResolvesPackagesByShortNameOrDirectory(): void
    {
        static::assertSame('src/Themes', $this->monorepo->package('themes')['path']);
        static::assertSame('src/Themes', $this->monorepo->package('Themes')['path']);
        static::assertSame('src/Themes', $this->monorepo->package('open-colibri/starter-themes')['path']);
    }

    public function testItBuildsRemoteUrls(): void
    {
        static::assertSame('git@github.com:open-colibri/starter-core.git', Monorepo::remoteUrl('git@github.com:{name}.git', 'open-colibri/starter-core'));
        static::assertSame('https://github.com/acme/sylius-core.git', Monorepo::remoteUrl('https://github.com/acme/sylius-{short}.git', 'open-colibri/starter-core'));
        static::assertSame('git@github.com:open-colibri/starter-core.git', Monorepo::remoteUrl('git@github.com:{repository}.git', 'open-colibri/starter-core'));
        static::assertSame('git@github.com:open-colibri/starter-menu.git', Monorepo::remoteUrl('git@github.com:{repository}.git', 'open-colibri/starter-menu'));
    }

    public function testItDetectsAnUnsyncedRootComposer(): void
    {
        $root = $this->monorepo->rootComposer();
        unset($root['replace']['open-colibri/starter-themes']);

        static::assertNotSame($root, $this->monorepo->mergedRootComposer($root));
        static::assertSame($this->monorepo->rootComposer(), $this->monorepo->mergedRootComposer($root));
    }
}
