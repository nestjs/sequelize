import { SequelizeModule, SequelizeModuleOptions } from '../../lib/index.js';
import { EntitiesMetadataStorage } from '../../lib/entities-metadata.storage.js';

describe('EntitiesMetadataStorage', () => {
  it('stores models added with unnamed options under the default connection', () => {
    class UnnamedOptionsModel {}

    SequelizeModule.forFeature([UnnamedOptionsModel], {
      dialect: 'postgres',
    } as SequelizeModuleOptions);

    expect(
      EntitiesMetadataStorage.getEntitiesByConnection('default'),
    ).toContain(UnnamedOptionsModel);
    expect(
      EntitiesMetadataStorage.getEntitiesByConnection({
        dialect: 'postgres',
      } as SequelizeModuleOptions),
    ).toContain(UnnamedOptionsModel);
  });

  it('keeps models of a named connection separate from the default one', () => {
    class NamedOptionsModel {}
    const name = 'entities-metadata-storage-spec';

    SequelizeModule.forFeature([NamedOptionsModel], {
      dialect: 'postgres',
      name,
    } as SequelizeModuleOptions);

    expect(EntitiesMetadataStorage.getEntitiesByConnection(name)).toEqual([
      NamedOptionsModel,
    ]);
    expect(
      EntitiesMetadataStorage.getEntitiesByConnection('default'),
    ).not.toContain(NamedOptionsModel);
  });
});
