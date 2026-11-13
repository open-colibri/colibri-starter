<?php

declare(strict_types=1);

namespace OpenColibri\Starter\Core\Tests\Unit;

use PHPUnit\Framework\TestCase;
use OpenColibri\Starter\Core\App;

final class AppTest extends TestCase
{
    public function testHostnameIsApexWhenSubdomainIsOmitted(): void
    {
        $app = new App('app', 'app', 'colibri-starter-sk.test');

        static::assertNull($app->subdomain());
        static::assertSame('colibri-starter-sk.test', $app->hostname());
    }

    public function testHostnamePrefixedWithSubdomain(): void
    {
        $app = new App('app', 'app', 'colibri-starter-sk.test', 'shop');

        static::assertSame('shop', $app->subdomain());
        static::assertSame('shop.colibri-starter-sk.test', $app->hostname());
    }

    public function testHostnameIsNullWithoutDomain(): void
    {
        $app = new App('app', 'app', null, 'shop');

        static::assertNull($app->hostname());
    }
}
