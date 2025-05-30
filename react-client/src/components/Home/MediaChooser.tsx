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
import { Box, Breadcrumbs, Button, Group, MantineSize, Modal, Paper, ScrollArea, Stack, TextInput, Tooltip } from '@mantine/core';
import axios from 'axios';
import { useState, ReactNode } from 'react';
import { IconFolder, IconHome, IconPictureInPicture, IconPictureInPictureOn } from '@tabler/icons-react';

import { Media } from '../../services/home-service';
import { I18nInterface } from '../../services/i18n-service';
import { openGitHubNewIssue, renderersApiUrl } from '../../utils';
import { showError } from '../../utils/notifications';

export default function MediaChooser(props: {
  i18n: I18nInterface,
  tooltipText: string,
  id: number,
  media: Media | null,
  callback: any,
  label?: string,
  disabled?: boolean,
  formKey?: string,
  size?: MantineSize,
}) {
  const [isLoading, setLoading] = useState(true);
  const [opened, setOpened] = useState(false);
  const i18n = props.i18n;

  const [medias, setMedias] = useState<Media[]>([]);
  const [parents, setParents] = useState([] as { value: string, label: string }[]);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const selectAndCloseModal = () => {
    if (selectedMedia) {
      if (props.formKey) {
        props.callback(props.formKey, selectedMedia);
      } else {
        props.callback(selectedMedia);
      }
      return setOpened(false);
    }
    showError({
      title: i18n.get('Error'),
      message: i18n.get('NoMediaSelected'),
    });
  };

  const getMedias = (media: string) => {
    axios.post(renderersApiUrl + 'browse', { id: props.id, media: media ? media : '0' })
      .then(function(response: any) {
        const mediasResponse = response.data;
        setMedias(mediasResponse.childrens);
        setParents(mediasResponse.parents.reverse());
      })
      .catch(function() {
        showError({
          id: 'data-loading',
          title: i18n.get('Error'),
          message: i18n.get('DataNotReceived'),
          onClick: () => { openGitHubNewIssue(); },
        });
      })
      .then(function() {
        setLoading(false);
      });
  };

  const input = (): ReactNode => {
    return <TextInput
      size={props.size}
      label={props.label}
      disabled={props.disabled}
      style={{ flex: 1 }}
      value={props.media ? props.media.label : ''}
      readOnly
    />
  }

  return (
    <Group>
      <>
        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title={
            <Group>
              <IconPictureInPictureOn />
              {i18n.get('SelectedMedia')}
            </Group>
          }
          scrollAreaComponent={ScrollArea.Autosize}
          size='lg'
        >
          <Box mx='auto'>
            <Paper shadow='md' p='xs' withBorder>
              <Group>
                <Breadcrumbs>
                  <Button
                    loading={isLoading}
                    onClick={() => getMedias('0')}
                    variant='default'
                    size='compact-md'
                  >
                    <IconHome />
                  </Button>
                  {parents.map(parent => (
                    <Button
                      loading={isLoading}
                      onClick={() => getMedias(parent.value)}
                      key={'breadcrumb' + parent.label}
                      variant='default'
                      size='compact-md'
                    >
                      {parent.label}
                    </Button>
                  ))}
                </Breadcrumbs>
              </Group>
            </Paper>
            <Stack gap='xs' align='flex-start' justify='flex-start' mt='sm'>
              {medias.map(media => (
                <Group key={'group' + media.label}>
                  <Button
                    leftSection={media.browsable ? <IconFolder size={18} /> : <IconPictureInPicture size={18} />}
                    variant={(selectedMedia?.value === media.value) ? 'light' : 'subtle'}
                    loading={isLoading}
                    onClick={() => media.browsable ? getMedias(media.value) : setSelectedMedia(media)}
                    key={media.label}
                    size='compact-md'
                  >
                    {media.label}
                  </Button>
                  {selectedMedia?.value === media.value &&
                    <Button
                      variant='filled'
                      loading={isLoading}
                      onClick={() => selectAndCloseModal()}
                      key={'select' + media.label}
                      size='compact-md'
                    >
                      Select
                    </Button>
                  }
                </Group>
              ))}
            </Stack>
          </Box>
        </Modal>

        {props.tooltipText ? (<Tooltip label={props.tooltipText} style={{ width: 350 }} color={'blue'} multiline withArrow={true}>
          {input()}
        </Tooltip>) : input()
        }
        {!props.disabled && (
          <Button
            mt={props.label ? '24px' : undefined}
            size={props.size}
            onClick={() => { getMedias(props.media ? props.media.value : '0'); setOpened(true); }}
            leftSection={<IconPictureInPictureOn size={18} />}
          >
            ...
          </Button>
        )}
      </>
    </Group>
  );
}

MediaChooser.defaultProps = {
  tooltipText: null,
}
