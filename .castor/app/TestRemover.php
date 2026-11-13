<?php

use OpenColibri\Starter\Core\App;
use OpenColibri\Starter\Plugins\Attribute\AsPluginRemover;
use function Castor\io;

#[AsPluginRemover(name: 'test_remover_with_class')]
class TestRemover
{
    public function __invoke(App $app): void
    {
        io()->success(\sprintf('New remover using a custom class is ok (app: %s)', $app->name()));
    }
}
