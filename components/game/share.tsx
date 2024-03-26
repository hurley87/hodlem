'use client';
import { Id } from '@/convex/_generated/dataModel';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import Challenger from './challenger';
import { useToast } from '../ui/use-toast';

export default function Share({
  id,
  challengers,
}: {
  id: Id<'games'>;
  challengers: `0x${string}`[];
  address: `0x${string}`;
}) {
  const url = `${window.origin}/game/${id}`;
  const { toast } = useToast();

  return (
    <Card>
      <CardHeader>
        <CardDescription>
          Anyone with the link can challenge you to a game
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input value={url} readOnly />
          <Button
            onClick={() => {
              navigator.clipboard.writeText(url);
              toast({
                title: 'Link copied',
                description: 'Send it to a friend',
              });
            }}
            variant="secondary"
            className="shrink-0"
          >
            Copy Link
          </Button>
        </div>
        {challengers?.length > 0 && <Separator className="my-4" />}
        {challengers?.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-sm font-medium">
              Create hand and set the buy-in
            </h4>
            <div className="grid gap-6">
              {challengers.map((challenger: `0x${string}`) => {
                return (
                  <Challenger key={challenger} id={id} address={challenger} />
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
