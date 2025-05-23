/*
 * This file is part of Universal Media Server, based on PS3 Media Server.
 *
 * This program is a free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by the Free
 * Software Foundation; version 2 of the License only.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
 * details.
 *
 * You should have received a copy of the GNU General Public License along with
 * this program; if not, write to the Free Software Foundation, Inc., 51
 * Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 */
import { ActionIcon, Box, Group, Table, Tabs, Text } from '@mantine/core';
import axios from 'axios';
import { useEffect, useState } from 'react';
import ReactCountryFlag from 'react-country-flag';
import { IconEdit, IconEditOff } from '@tabler/icons-react';

import MemoryBar from '../MemoryBar/MemoryBar';
import { havePermission, Permissions } from '../../services/accounts-service';
import { I18nInterface } from '../../services/i18n-service';
import { MainInterface } from '../../services/main-service';
import { ServerEventInterface, UmsMemory } from '../../services/server-event-service';
import { SessionInterface } from '../../services/session-service';
import { aboutApiUrl } from '../../utils';
import { showError } from '../../utils/notifications';

const About = ({ i18n, main, sse, session }: { i18n: I18nInterface, main:MainInterface, sse: ServerEventInterface, session: SessionInterface }) => {
  const [aboutDatas, setAboutDatas] = useState({ links: [] } as any);
  const [memory, setMemory] = useState<UmsMemory>();
  const canView = havePermission(session, Permissions.settings_view | Permissions.settings_modify);
  const languagesRows = i18n.languages.map((language) => (
    <Table.Tr key={language.id}>
      <Table.Td><Group style={{ cursor: 'default' }}><ReactCountryFlag countryCode={language.country} style={{ fontSize: '1.5em' }} /><Text>{language.name}</Text></Group></Table.Td>
      {language.id === 'en-US' ? (
        <Table.Td><Group style={{ cursor: 'default' }} justify='flex-end'><Text>{i18n.get('Source')}</Text><ActionIcon disabled><IconEditOff /></ActionIcon></Group></Table.Td>
      ) : (
        <Table.Td><Group style={{ cursor: 'default' }} justify='flex-end'>
          <Text>{language.coverage === 100 ? i18n.get('Completed') : i18n.get('InProgress') + ' (' + language.coverage + '%)'}</Text>
          <ActionIcon variant='default' onClick={() => { window.open('https://crowdin.com/project/universalmediaserver/' + language.id, '_blank'); }}>
            <IconEdit />
          </ActionIcon>
        </Group></Table.Td>
      )}
    </Table.Tr>
  ));
  const linksRows = aboutDatas.links.map((link: { key: string, value: string }) => (
    <Table.Tr key={link.key}>
      <Table.Td><Text ta='center' style={{ cursor: 'pointer' }} onClick={() => { window.open(link.value, '_blank'); }}>{link.key}</Text></Table.Td>
    </Table.Tr>
  ));

  //set the document Title to About
  useEffect(() => {
    document.title = "Universal Media Server - About";
    if (canView && !session.player) {
      session.useSseAs('About')
    } else {
      session.stopSse()
    }
    session.stopPlayerSse()
    main.setNavbarValue(undefined)
  }, []);

  useEffect(() => {
    axios.get(aboutApiUrl)
      .then(function(response: any) {
        setAboutDatas(response.data);
      })
      .catch(function() {
        showError({
          id: 'about-data-loading',
          title: i18n.get('Error'),
          message: i18n.get('DataNotReceived'),
        });
      });
  }, [i18n.language]);

  useEffect(() => {
    setMemory(sse.memory);
  }, [sse.memory]);

  return (
    <Box style={{ maxWidth: 1024 }} mx='auto'>
      <Tabs defaultValue='application'>
        <Tabs.List>
          <Tabs.Tab value='application'>{i18n.get('Application')}</Tabs.Tab>
          <Tabs.Tab value='translations'>{i18n.get('Translations')}</Tabs.Tab>
          <Tabs.Tab value='relatedLinks'>{i18n.get('RelatedLinks_title')}</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value='application' pt='xs'>
          <Table striped>
            <Table.Thead>
              <Table.Tr>
                <Table.Th colSpan={2}><Text c='blue' size='lg' ta='center'>{aboutDatas.app}</Text></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              <Table.Tr>
                <Table.Td>{i18n.get('Version')}</Table.Td>
                <Table.Td>{aboutDatas.version}</Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{i18n.get('GitCommitHash')}</Table.Td>
                <Table.Td><Text style={{ cursor: 'pointer' }} onClick={() => { window.open(aboutDatas.commitUrl, '_blank'); }}>{aboutDatas.commit}</Text></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{i18n.get('Website')}</Table.Td>
                <Table.Td><Text style={{ cursor: 'pointer' }} onClick={() => { window.open(aboutDatas.website, '_blank'); }}>{aboutDatas.website}</Text></Table.Td>
              </Table.Tr>
              <Table.Tr>
                <Table.Td>{i18n.get('Licence')}</Table.Td>
                <Table.Td><Text style={{ cursor: 'pointer' }} onClick={() => { window.open(aboutDatas.licenceUrl, '_blank'); }}>{aboutDatas.licence}</Text></Table.Td>
              </Table.Tr>
            </Table.Tbody>
            {(canView && !session.player) && <>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th colSpan={2}><Text c='blue' size='lg' ta='center'>{i18n.get('System')}</Text></Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Td>{i18n.get('OperatingSystem')}</Table.Td>
                  <Table.Td>{aboutDatas.operatingSystem}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{i18n.get('SystemMemorySize')}</Table.Td>
                  <Table.Td>{aboutDatas.systemMemorySize}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Td>{i18n.get('JVMMemoryMax')}</Table.Td>
                  <Table.Td>{aboutDatas.jvmMemoryMax}</Table.Td>
                </Table.Tr>
                {memory &&
                  <Table.Tr>
                    <Table.Td>{i18n.get('JVMMemoryUsage')}</Table.Td>
                    <Table.Td><MemoryBar decorate={false} memory={memory} i18n={i18n} /></Table.Td>
                  </Table.Tr>
                }
              </Table.Tbody>
            </>}
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value='translations'>
          <Table highlightOnHover>
            <Table.Tbody>
              {languagesRows}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
        <Tabs.Panel value='relatedLinks'>
          <Table>
            <Table.Tbody>
              {linksRows}
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
};

export default About;
